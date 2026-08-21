import { createAuthenticationApiClient } from "@/lib/server/authentication-api"
import { getServerEnvironment } from "@/lib/server/environment"
import { assertTrustedRequestOrigin, InvalidRequestOriginError } from "@/lib/server/request-security"
import { resolveServerSession } from "@/lib/server/session"
import type { SessionCookieOptions } from "@/lib/server/session-cookies"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

type PendingCookie = {
  name: string
  options: SessionCookieOptions
  value: string
}

const NO_STORE_HEADERS = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Usa POST porque uma consulta com access token expirado pode rotacionar o
 * refresh token e emitir Set-Cookie. Assim, a validação Origin permanece
 * obrigatória em toda operação que altera a sessão.
 */
export async function POST(request: NextRequest) {
  try {
    const environment = getServerEnvironment()
    assertTrustedRequestOrigin(request, environment.appOrigin)

    const pendingCookies: PendingCookie[] = []
    const session = await resolveServerSession({
      client: createAuthenticationApiClient(environment),
      cookieReader: request.cookies,
      cookieWriter: {
        set(name, value, options) {
          pendingCookies.push({ name, options, value })
        },
      },
    })

    const response = createSessionResponse(session)

    for (const cookie of pendingCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options)
    }

    return response
  } catch (error) {
    if (error instanceof InvalidRequestOriginError) {
      return NextResponse.json(
        { error: { code: "REQUEST_NOT_ALLOWED", message: "Não foi possível concluir esta solicitação." } },
        { headers: NO_STORE_HEADERS, status: 403 }
      )
    }

    console.error("Authentication session request failed", {
      failureType: error instanceof Error ? error.name : "UnknownError",
    })

    return NextResponse.json(
      { authenticated: false, error: { code: "SERVICE_UNAVAILABLE" } },
      { headers: NO_STORE_HEADERS, status: 503 }
    )
  }
}

function createSessionResponse(session: Awaited<ReturnType<typeof resolveServerSession>>): NextResponse {
  if (session.state === "authenticated") {
    return NextResponse.json(
      {
        accessTokenExpiresAt: session.accessTokenExpiresAt,
        authenticated: true,
        user: {
          email: session.user.email,
          emailVerified: session.user.emailVerified,
          id: session.user.id,
          name: session.user.name,
          role: session.user.role,
        },
      },
      { headers: NO_STORE_HEADERS }
    )
  }

  if (session.state === "unavailable") {
    return NextResponse.json(
      { authenticated: false, error: { code: "SERVICE_UNAVAILABLE" } },
      { headers: NO_STORE_HEADERS, status: 503 }
    )
  }

  return NextResponse.json({ authenticated: false }, { headers: NO_STORE_HEADERS, status: 401 })
}
