import type {
  AuthBffError,
  AuthBffErrorCode,
  AuthBffResult,
  PublicSession,
} from "../types/auth"

type LoginRequest = {
  email: string
  password: string
}

type RegisterRequest = {
  email: string
  name: string
  password: string
}

type VerifyEmailRequest = {
  token: string
}

type ForgotPasswordRequest = {
  email: string
}

type ResendVerificationRequest = {
  email: string
}

type ResetPasswordRequest = {
  newPassword: string
  token: string
}

type SocialLoginRequest = {
  provider: "GOOGLE"
  token: string
}

const BFF_ERROR_CODES = new Set<AuthBffErrorCode>([
  "AUTHENTICATION_REQUEST_FAILED",
  "ACCOUNT_REQUIRES_ACTION",
  "INVALID_CREDENTIALS",
  "INVALID_RECOVERY_LINK",
  "INVALID_VERIFICATION_LINK",
  "NETWORK_ERROR",
  "RATE_LIMITED",
  "REGISTRATION_CONFLICT",
  "REQUEST_NOT_ALLOWED",
  "SERVICE_UNAVAILABLE",
  "SESSION_UNAVAILABLE",
  "SOCIAL_AUTH_FAILED",
  "VALIDATION_ERROR",
])

const GENERIC_ERROR: AuthBffError = {
  code: "AUTHENTICATION_REQUEST_FAILED",
  message: "Não foi possível concluir esta solicitação. Tente novamente.",
  retryable: false,
}

/**
 * Único ponto client-side que conversa com o BFF. Todas as URLs são relativas
 * ao próprio CAPTAGOV; tokens de sessão nunca entram em headers, corpo ou storage.
 */
const authBffClient = {
  forgotPassword: (input: ForgotPasswordRequest) => request<void>("/api/auth/forgot-password", input),
  login: (input: LoginRequest) => request<void>("/api/auth/login", input),
  logout: () => request<void>("/api/auth/logout"),
  register: (input: RegisterRequest) => request<void>("/api/auth/register", input),
  resetPassword: (input: ResetPasswordRequest) => request<void>("/api/auth/reset-password", input),
  socialLogin: (input: SocialLoginRequest) => request<void>("/api/auth/login/social", input),
  resendVerification: (input: ResendVerificationRequest) => request<void>("/api/auth/resend-verification", input),
  session: () => request<PublicSession>("/api/auth/session"),
  verifyEmail: (input: VerifyEmailRequest) => request<void>("/api/auth/verify-email", input),
}

async function request<Data>(path: string, body?: object): Promise<AuthBffResult<Data>> {
  try {
    const response = await fetch(path, {
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      method: "POST",
    })
    const payload = await readJson(response)

    if (!response.ok) {
      return { error: getPublicError(payload), ok: false, status: response.status }
    }

    return { data: payload as Data, ok: true, status: response.status }
  } catch {
    return {
      error: {
        code: "NETWORK_ERROR",
        message: "Não foi possível conectar ao serviço. Tente novamente em instantes.",
        retryable: true,
      },
      ok: false,
      status: 503,
    }
  }
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type")

  if (!contentType?.includes("application/json")) {
    return undefined
  }

  try {
    return await response.json()
  } catch {
    return undefined
  }
}

function getPublicError(payload: unknown): AuthBffError {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return GENERIC_ERROR
  }

  const { code, message, retryable } = payload.error

  if (!isBffErrorCode(code) || typeof message !== "string" || typeof retryable !== "boolean") {
    return GENERIC_ERROR
  }

  return { code, message, retryable }
}

function isBffErrorCode(value: unknown): value is AuthBffErrorCode {
  return typeof value === "string" && BFF_ERROR_CODES.has(value as AuthBffErrorCode)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export { authBffClient }
export type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  SocialLoginRequest,
  VerifyEmailRequest,
}
