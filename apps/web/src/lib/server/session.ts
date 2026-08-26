import "server-only"

import type { AuthenticationApiClient, CurrentUserResponse } from "@capta/api-client"

import { createAuthenticationApiClient } from "./authentication-api"
import { logAuthenticationFailure, logUnexpectedAuthenticationFailure } from "./auth-bff-route"
import { clearSessionCookies, getSessionTokens, setSessionCookies, type SessionCookieStore } from "./session-cookies"

type SessionCookieReader = Pick<SessionCookieStore, "get">
type SessionCookieWriter = Pick<SessionCookieStore, "set">

type AuthenticatedServerSession = {
  /** Exclusivo do servidor; nunca deve ser serializado ao navegador. */
  accessToken: string
  accessTokenExpiresAt: string | null
  refreshed: boolean
  state: "authenticated"
  user: CurrentUserResponse
}

type AnonymousServerSession = {
  reason: "missing" | "refresh-failed" | "revoked"
  state: "anonymous"
}

type RefreshRequiredServerSession = {
  state: "refresh-required"
}

type UnavailableServerSession = {
  state: "unavailable"
}

type ServerSession =
  | AnonymousServerSession
  | AuthenticatedServerSession
  | RefreshRequiredServerSession
  | UnavailableServerSession

type ResolveServerSessionOptions = {
  client?: AuthenticationApiClient
  cookieReader: SessionCookieReader
  cookieWriter?: SessionCookieWriter
}

/**
 * Resolve a sessão usando o access token atual. Em um 401, a renovação ocorre
 * apenas quando uma resposta mutável foi fornecida: refresh token rotacionado
 * nunca é obtido sem que os dois cookies novos possam ser persistidos.
 */
async function resolveServerSession({
  client = createAuthenticationApiClient(),
  cookieReader,
  cookieWriter,
}: ResolveServerSessionOptions): Promise<ServerSession> {
  const tokens = getSessionTokens(cookieReader)

  if (!tokens) {
    return { reason: "missing", state: "anonymous" }
  }

  try {
    const profileResponse = await client.getCurrentUser({ accessToken: tokens.accessToken })

    if (profileResponse.status === 200 && isCurrentUserResponse(profileResponse.data)) {
      return createAuthenticatedSession(profileResponse.data, tokens.accessToken, false)
    }

    if (profileResponse.status !== 401) {
      logAuthenticationFailure("session", profileResponse)
      return { state: "unavailable" }
    }

    if (!cookieWriter) {
      return { state: "refresh-required" }
    }

    return await refreshAndRetryProfile(client, cookieWriter, tokens.refreshToken)
  } catch (error) {
    logUnexpectedAuthenticationFailure("session", error)
    return { state: "unavailable" }
  }
}

async function refreshAndRetryProfile(
  client: AuthenticationApiClient,
  cookieWriter: SessionCookieWriter,
  refreshToken: string
): Promise<ServerSession> {
  try {
    const refreshResponse = await client.refresh({ refreshToken })
    const refreshedTokens = refreshResponse.status === 200 ? getRefreshedTokens(refreshResponse.data) : undefined

    if (!refreshedTokens) {
      logAuthenticationFailure("session", refreshResponse)
      clearSessionCookies(cookieWriter)
      return { reason: "refresh-failed", state: "anonymous" }
    }

    setSessionCookies(cookieWriter, refreshedTokens)

    const retryProfileResponse = await client.getCurrentUser({ accessToken: refreshedTokens.accessToken })

    if (retryProfileResponse.status === 200 && isCurrentUserResponse(retryProfileResponse.data)) {
      return createAuthenticatedSession(retryProfileResponse.data, refreshedTokens.accessToken, true)
    }

    logAuthenticationFailure("session", retryProfileResponse)

    if (retryProfileResponse.status === 401) {
      clearSessionCookies(cookieWriter)
      return { reason: "revoked", state: "anonymous" }
    }

    return { state: "unavailable" }
  } catch (error) {
    logUnexpectedAuthenticationFailure("session", error)
    clearSessionCookies(cookieWriter)
    return { reason: "refresh-failed", state: "anonymous" }
  }
}

function getRefreshedTokens(value: unknown): { accessToken: string; refreshToken: string } | undefined {
  if (!isRecord(value) || !isNonEmptyString(value.accessToken) || !isNonEmptyString(value.refreshToken)) {
    return undefined
  }

  return { accessToken: value.accessToken, refreshToken: value.refreshToken }
}

function createAuthenticatedSession(
  user: CurrentUserResponse,
  accessToken: string,
  refreshed: boolean
): AuthenticatedServerSession {
  return {
    accessToken,
    accessTokenExpiresAt: getApproximateAccessTokenExpiry(accessToken),
    refreshed,
    state: "authenticated",
    user,
  }
}

/**
 * O backend é a autoridade para validar o JWT via /users/me. Aqui lemos apenas
 * o claim exp para informar a interface; token inválido, opaco ou malformado
 * retorna null e jamais é exposto ao cliente.
 */
function getApproximateAccessTokenExpiry(accessToken: string): string | null {
  const segments = accessToken.split(".")

  if (segments.length !== 3 || segments[1].length > 4096) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8"))

    if (!isRecord(payload) || typeof payload.exp !== "number" || !Number.isSafeInteger(payload.exp)) {
      return null
    }

    const expiresAt = new Date(payload.exp * 1000)
    return Number.isNaN(expiresAt.getTime()) ? null : expiresAt.toISOString()
  } catch {
    return null
  }
}

function isCurrentUserResponse(value: unknown): value is CurrentUserResponse {
  if (!isRecord(value)) {
    return false
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.email) &&
    (value.role === "USER" || value.role === "ADMIN") &&
    (value.status === "ACTIVE" || value.status === "INACTIVE") &&
    typeof value.emailVerified === "boolean" &&
    Array.isArray(value.socialProviders) &&
    value.socialProviders.every(isNonEmptyString) &&
    isProfile(value.profile) &&
    isNonEmptyString(value.createdAt) &&
    isNonEmptyString(value.updatedAt)
  )
}

function isProfile(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.address)) {
    return false
  }

  return (
    isNullableString(value.avatarUrl) &&
    isNullableString(value.phone) &&
    isNullableString(value.birthDate) &&
    isNullableString(value.bio) &&
    isNullableString(value.locale) &&
    isNullableString(value.timezone) &&
    isNullableString(value.address.street) &&
    isNullableString(value.address.city) &&
    isNullableString(value.address.state) &&
    isNullableString(value.address.zipCode) &&
    isNullableString(value.address.country)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string"
}

export { resolveServerSession }
export type {
  AnonymousServerSession,
  AuthenticatedServerSession,
  RefreshRequiredServerSession,
  ResolveServerSessionOptions,
  ServerSession,
  UnavailableServerSession,
}
