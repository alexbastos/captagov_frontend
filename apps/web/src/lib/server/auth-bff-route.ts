import "server-only"

import { getApiErrorLogContext, normalizeAuthenticationError, type NormalizedAuthenticationError } from "@capta/api-client"
import { NextResponse } from "next/server"
import { z } from "zod"

import { createAuthenticationApiClient } from "./authentication-api"
import { getServerEnvironment } from "./environment"
import { assertTrustedRequestOrigin, InvalidRequestOriginError } from "./request-security"

type AuthenticationAction =
  | "forgot-password"
  | "login"
  | "logout"
  | "register"
  | "reset-password"
  | "resend-verification"
  | "session"
  | "social-login"
  | "verify-email"

type SessionTokens = {
  accessToken: string
  refreshToken: string
}

type PublicAuthenticationError = {
  code:
    | "ACCOUNT_REQUIRES_ACTION"
    | "AUTHENTICATION_REQUEST_FAILED"
    | "INVALID_CREDENTIALS"
    | "INVALID_RECOVERY_LINK"
    | "INVALID_VERIFICATION_LINK"
    | "NETWORK_ERROR"
    | "RATE_LIMITED"
    | "REGISTRATION_CONFLICT"
    | "REQUEST_NOT_ALLOWED"
    | "SERVICE_UNAVAILABLE"
    | "SOCIAL_AUTH_FAILED"
    | "VALIDATION_ERROR"
  message: string
  retryable: boolean
  status: 400 | 401 | 403 | 409 | 429 | 503
}

const NO_STORE_HEADERS = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
}

const RegisterRequestSchema = z
  .object({
    email: z.string().trim().email(),
    name: z.string().trim().min(2).max(100),
    password: z.string().min(8),
  })
  .strict()

const LoginRequestSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8),
  })
  .strict()

const SocialLoginRequestSchema = z
  .object({
    provider: z.literal("GOOGLE"),
    token: z.string().trim().min(1).max(16_384),
  })
  .strict()

const VerifyEmailRequestSchema = z.object({ token: z.string().trim().min(1).max(4096) }).strict()

const ForgotPasswordRequestSchema = z.object({ email: z.string().trim().email() }).strict()

const ResendVerificationRequestSchema = z.object({ email: z.string().trim().email() }).strict()

const ResetPasswordRequestSchema = z
  .object({
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9\s]/)
      .regex(/^\S+$/),
    token: z.string().trim().min(1).max(4096),
  })
  .strict()

function getAuthenticationRouteClient(request: Request) {
  const environment = getServerEnvironment()
  assertTrustedRequestOrigin(request, environment.appOrigin)

  return createAuthenticationApiClient(environment)
}

async function parseJsonBody<Output>(request: Request, schema: z.ZodType<Output>): Promise<Output | undefined> {
  try {
    const result = schema.safeParse(await request.json())
    return result.success ? result.data : undefined
  } catch {
    return undefined
  }
}

function createSuccessResponse(status = 200): NextResponse {
  return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS, status })
}

function createInvalidRequestResponse(): NextResponse {
  return createAuthenticationErrorResponse(undefined, { data: undefined, headers: new Headers(), status: 400 })
}

function createUnauthenticatedResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "SESSION_UNAVAILABLE",
        message: "Sua sessão não está disponível. Entre novamente para continuar.",
        retryable: false,
      },
    },
    { headers: NO_STORE_HEADERS, status: 401 }
  )
}

function createUpstreamErrorResponse(action: AuthenticationAction, upstreamResponse: unknown): NextResponse {
  logAuthenticationFailure(action, upstreamResponse)
  return createAuthenticationErrorResponse(action, upstreamResponse)
}

function createUnexpectedRouteErrorResponse(action: AuthenticationAction, error: unknown): NextResponse {
  if (error instanceof InvalidRequestOriginError) {
    return NextResponse.json(
      { error: { code: "REQUEST_NOT_ALLOWED", message: "Não foi possível concluir esta solicitação." } },
      { headers: NO_STORE_HEADERS, status: 403 }
    )
  }

  logUnexpectedAuthenticationFailure(action, error)

  return createAuthenticationErrorResponse(action, error)
}

function createAuthenticationErrorResponse(action: AuthenticationAction | undefined, error: unknown): NextResponse {
  const normalized = normalizeAuthenticationError(error)
  const publicError = getPublicAuthenticationError(action, normalized)

  return NextResponse.json(
    {
      error: {
        code: publicError.code,
        message: publicError.message,
        retryable: publicError.retryable,
      },
    },
    { headers: NO_STORE_HEADERS, status: publicError.status }
  )
}

function getPublicAuthenticationError(
  action: AuthenticationAction | undefined,
  normalized: NormalizedAuthenticationError
): PublicAuthenticationError {
  if (normalized.code === "RATE_LIMITED") {
    return {
      code: "RATE_LIMITED",
      message: normalized.message,
      retryable: normalized.retryable,
      status: 429,
    }
  }

  if (normalized.code === "SERVICE_UNAVAILABLE") {
    return {
      code: "SERVICE_UNAVAILABLE",
      message: normalized.message,
      retryable: normalized.retryable,
      status: 503,
    }
  }

  if (normalized.code === "NETWORK_ERROR") {
    return {
      code: "NETWORK_ERROR",
      message: normalized.message,
      retryable: normalized.retryable,
      status: 503,
    }
  }

  if (normalized.code === "UNAUTHORIZED" && action === "login") {
    return {
      code: "INVALID_CREDENTIALS",
      message: "E-mail ou senha incorretos.",
      retryable: false,
      status: 401,
    }
  }

  if (normalized.code === "FORBIDDEN" && action === "login") {
    return {
      code: "ACCOUNT_REQUIRES_ACTION",
      message: "Há uma pendência para concluir seu acesso. Verifique seu e-mail ou entre em contato com o suporte.",
      retryable: false,
      status: 403,
    }
  }

  if (normalized.code === "CONFLICT" && action === "register") {
    return {
      code: "REGISTRATION_CONFLICT",
      message: "Não foi possível concluir o cadastro com os dados informados.",
      retryable: false,
      status: 409,
    }
  }

  if (normalized.code === "BAD_REQUEST" && action === "reset-password") {
    return {
      code: "INVALID_RECOVERY_LINK",
      message: "Este link de recuperação é inválido ou expirou. Solicite um novo link.",
      retryable: false,
      status: 400,
    }
  }

  if (normalized.code === "BAD_REQUEST" && action === "verify-email") {
    return {
      code: "INVALID_VERIFICATION_LINK",
      message: "Este link de confirmação é inválido ou expirou. Solicite um novo link.",
      retryable: false,
      status: 400,
    }
  }

  if (normalized.code === "BAD_REQUEST" && action === "social-login") {
    return {
      code: "SOCIAL_AUTH_FAILED",
      message: "Não foi possível concluir o login com Google. Tente novamente.",
      retryable: false,
      status: 400,
    }
  }

  if (normalized.code === "BAD_REQUEST") {
    return {
      code: "VALIDATION_ERROR",
      message: "Revise os dados informados e tente novamente.",
      retryable: false,
      status: 400,
    }
  }

  return {
    code: "AUTHENTICATION_REQUEST_FAILED",
    message: "Não foi possível concluir esta solicitação. Tente novamente.",
    retryable: false,
    status: 503,
  }
}

function getLoginSessionTokens(value: unknown): SessionTokens | undefined {
  if (!isRecord(value) || !isNonEmptyString(value.accessToken) || !isNonEmptyString(value.refreshToken)) {
    return undefined
  }

  return {
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
  }
}

function logAuthenticationFailure(action: AuthenticationAction, upstreamResponse: unknown): void {
  console.error("Authentication API request failed", {
    action,
    ...getApiErrorLogContext(upstreamResponse),
  })
}

function logUnexpectedAuthenticationFailure(action: AuthenticationAction, error: unknown): void {
  console.error("Authentication BFF request failed", {
    action,
    failureType: error instanceof Error ? error.name : "UnknownError",
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export {
  createInvalidRequestResponse,
  createSuccessResponse,
  createUnauthenticatedResponse,
  createUnexpectedRouteErrorResponse,
  createUpstreamErrorResponse,
  getAuthenticationRouteClient,
  getLoginSessionTokens,
  LoginRequestSchema,
  logAuthenticationFailure,
  logUnexpectedAuthenticationFailure,
  parseJsonBody,
  RegisterRequestSchema,
  ResendVerificationRequestSchema,
  ResetPasswordRequestSchema,
  SocialLoginRequestSchema,
  VerifyEmailRequestSchema,
  ForgotPasswordRequestSchema,
}
