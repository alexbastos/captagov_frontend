import {
  createSuccessResponse,
  createUnexpectedRouteErrorResponse,
  getAuthenticationRouteClient,
  logAuthenticationFailure,
  logUnexpectedAuthenticationFailure,
} from "@/lib/server/auth-bff-route"
import { clearSessionCookies, getSessionTokens } from "@/lib/server/session-cookies"
import { InvalidRequestOriginError } from "@/lib/server/request-security"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const client = getAuthenticationRouteClient(request)
    const response = createSuccessResponse()
    const tokens = getSessionTokens(request.cookies)

    if (tokens) {
      const upstreamResponse = await client.logout({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })

      if (upstreamResponse.status !== 204) {
        logAuthenticationFailure("logout", upstreamResponse)
      }
    }

    clearSessionCookies(response.cookies)
    return response
  } catch (error) {
    if (error instanceof InvalidRequestOriginError) {
      return createUnexpectedRouteErrorResponse("logout", error)
    }

    logUnexpectedAuthenticationFailure("logout", error)

    const response = createSuccessResponse()
    clearSessionCookies(response.cookies)
    return response
  }
}
