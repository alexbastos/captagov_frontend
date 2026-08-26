import "server-only"

import type { AuthenticationApiClient } from "@capta/api-client"
import { NextResponse, type NextRequest } from "next/server"

import { createAuthenticationApiClient } from "./authentication-api"
import { getServerEnvironment } from "./environment"
import { assertTrustedRequestOrigin } from "./request-security"
import { resolveServerSession, type AuthenticatedServerSession } from "./session"
import type { SessionCookieOptions } from "./session-cookies"

type PendingCookie = {
  name: string
  options: SessionCookieOptions
  value: string
}

type SettingsRouteContext = {
  client: AuthenticationApiClient
  session: AuthenticatedServerSession | undefined
  applySessionCookies(response: NextResponse): void
}

const NO_STORE_HEADERS = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
}

/**
 * As rotas de configurações usam métodos com Origin obrigatório. Isso permite
 * rotacionar tokens expirados e persistir os cookies renovados sem abrir mão
 * da proteção contra CSRF.
 */
async function getAuthenticatedSettingsContext(request: NextRequest): Promise<SettingsRouteContext> {
  const environment = getServerEnvironment()
  assertTrustedRequestOrigin(request, environment.appOrigin)

  const client = createAuthenticationApiClient(environment)
  const pendingCookies: PendingCookie[] = []
  const session = await resolveServerSession({
    client,
    cookieReader: request.cookies,
    cookieWriter: {
      set(name, value, options) {
        pendingCookies.push({ name, options, value })
      },
    },
  })

  return {
    client,
    session: session.state === "authenticated" ? session : undefined,
    applySessionCookies(response) {
      for (const cookie of pendingCookies) {
        response.cookies.set(cookie.name, cookie.value, cookie.options)
      }
    },
  }
}

function createSettingsResponse(context: SettingsRouteContext, body: unknown, status = 200): NextResponse {
  const response = NextResponse.json(body, { headers: NO_STORE_HEADERS, status })
  context.applySessionCookies(response)
  return response
}

function applySettingsSessionCookies(context: SettingsRouteContext, response: NextResponse): NextResponse {
  context.applySessionCookies(response)
  return response
}

export { applySettingsSessionCookies, createSettingsResponse, getAuthenticatedSettingsContext }
