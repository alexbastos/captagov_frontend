import {
  createInvalidRequestResponse,
  createUnauthenticatedResponse,
  createUnexpectedRouteErrorResponse,
  createUpstreamErrorResponse,
  LinkSocialAccountRequestSchema,
  parseJsonBody,
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

    const input = await parseJsonBody(request, LinkSocialAccountRequestSchema)

    if (!input) {
      return applySettingsSessionCookies(context, createInvalidRequestResponse())
    }

    const upstreamResponse = await context.client.linkSocialAccount(input, { accessToken: context.session.accessToken })

    if (upstreamResponse.status !== 200) {
      return applySettingsSessionCookies(context, createUpstreamErrorResponse("link-social-account", upstreamResponse))
    }

    return createSettingsResponse(context, { success: true })
  } catch (error) {
    return createUnexpectedRouteErrorResponse("link-social-account", error)
  }
}
