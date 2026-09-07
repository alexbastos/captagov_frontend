import {
  createInvalidRequestResponse,
  createUnauthenticatedResponse,
  createUnexpectedRouteErrorResponse,
  createUpstreamErrorResponse,
  parseJsonBody,
  UpdateProfileRequestSchema,
} from "@/lib/server/auth-bff-route"
import {
  applySettingsSessionCookies,
  createSettingsResponse,
  getAuthenticatedSettingsContext,
} from "@/lib/server/settings-bff-route"
import { setRegionalPreferenceCookies } from "@/lib/server/regional-preference"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const context = await getAuthenticatedSettingsContext(request)
    return context.session
      ? createSettingsResponse(context, { user: context.session.user })
      : applySettingsSessionCookies(context, createUnauthenticatedResponse())
  } catch (error) {
    return createUnexpectedRouteErrorResponse("session", error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const context = await getAuthenticatedSettingsContext(request)

    if (!context.session) {
      return applySettingsSessionCookies(context, createUnauthenticatedResponse())
    }

    const input = await parseJsonBody(request, UpdateProfileRequestSchema)

    if (!input) {
      return applySettingsSessionCookies(context, createInvalidRequestResponse())
    }

    const upstreamResponse = await context.client.updateCurrentUser(context.session.user.id, input, {
      accessToken: context.session.accessToken,
    })

    if (upstreamResponse.status !== 200 || !upstreamResponse.data || !("profile" in upstreamResponse.data)) {
      return applySettingsSessionCookies(context, createUpstreamErrorResponse("update-profile", upstreamResponse))
    }

    const response = createSettingsResponse(context, { user: upstreamResponse.data })
    setRegionalPreferenceCookies(response.cookies, upstreamResponse.data.profile)

    return response
  } catch (error) {
    return createUnexpectedRouteErrorResponse("update-profile", error)
  }
}
