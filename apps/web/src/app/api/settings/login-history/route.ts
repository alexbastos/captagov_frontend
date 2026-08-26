import {
  createUnauthenticatedResponse,
  createUnexpectedRouteErrorResponse,
  createUpstreamErrorResponse,
} from "@/lib/server/auth-bff-route"
import {
  applySettingsSessionCookies,
  createSettingsResponse,
  getAuthenticatedSettingsContext,
} from "@/lib/server/settings-bff-route"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const context = await getAuthenticatedSettingsContext(request)

    if (!context.session) {
      return applySettingsSessionCookies(context, createUnauthenticatedResponse())
    }

    const upstreamResponse = await context.client.getLoginHistory({ accessToken: context.session.accessToken })

    if (upstreamResponse.status !== 200 || !upstreamResponse.data) {
      return applySettingsSessionCookies(context, createUpstreamErrorResponse("login-history", upstreamResponse))
    }

    return createSettingsResponse(context, { history: upstreamResponse.data })
  } catch (error) {
    return createUnexpectedRouteErrorResponse("login-history", error)
  }
}
