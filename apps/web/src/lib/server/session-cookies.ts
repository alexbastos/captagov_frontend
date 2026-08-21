import "server-only"

import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "@/lib/auth-constants"

const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

type SessionTokens = {
  accessToken: string
  refreshToken: string
}

type SessionCookie = {
  value: string
}

type SessionCookieOptions = {
  expires?: Date
  httpOnly: true
  maxAge: number
  path: "/"
  priority: "high"
  sameSite: "lax"
  secure: boolean
}

type SessionCookieStore = {
  get(name: string): SessionCookie | undefined
  set(name: string, value: string, options: SessionCookieOptions): void
}

const COMMON_COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  priority: "high",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const

const ACCESS_TOKEN_COOKIE_OPTIONS: SessionCookieOptions = {
  ...COMMON_COOKIE_OPTIONS,
  maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
}

const REFRESH_TOKEN_COOKIE_OPTIONS: SessionCookieOptions = {
  ...COMMON_COOKIE_OPTIONS,
  maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
}

function getSessionTokens(cookieStore: Pick<SessionCookieStore, "get">): SessionTokens | undefined {
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value

  if (!isNonEmptyString(accessToken) || !isNonEmptyString(refreshToken)) {
    return undefined
  }

  return { accessToken, refreshToken }
}

/**
 * Deve ser chamada exclusivamente em um Route Handler ou Server Function,
 * antes que a resposta comece a ser enviada ao navegador.
 */
function setSessionCookies(cookieStore: Pick<SessionCookieStore, "set">, tokens: SessionTokens): void {
  if (!isNonEmptyString(tokens.accessToken) || !isNonEmptyString(tokens.refreshToken)) {
    throw new Error("Session tokens must not be empty")
  }

  cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
}

/**
 * Expira ambos os cookies com os mesmos atributos de escopo usados na criação.
 * A operação é intencionalmente idempotente: pode ser executada mesmo quando
 * apenas um dos cookies existe ou quando a revogação upstream falha.
 */
function clearSessionCookies(cookieStore: Pick<SessionCookieStore, "set">): void {
  const expirationOptions: SessionCookieOptions = {
    ...COMMON_COOKIE_OPTIONS,
    expires: new Date(0),
    maxAge: 0,
  }

  cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, "", expirationOptions)
  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, "", expirationOptions)
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  clearSessionCookies,
  getSessionTokens,
  setSessionCookies,
}
export type { SessionCookieOptions, SessionCookieStore, SessionTokens }
