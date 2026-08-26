import {
  createInvalidRequestResponse,
  createSuccessResponse,
  createUnauthenticatedResponse,
  createUnexpectedRouteErrorResponse,
  createUpstreamErrorResponse,
  RouteIdentifierSchema,
} from "@/lib/server/auth-bff-route"
import { applySettingsSessionCookies, getAuthenticatedSettingsContext } from "@/lib/server/settings-bff-route"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type RouteContext = { params: Promise<{ sessionId: string }> }

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await getAuthenticatedSettingsContext(request)

    if (!context.session) {
      return applySettingsSessionCookies(context, createUnauthenticatedResponse())
    }

    const sessionId = RouteIdentifierSchema.safeParse((await params).sessionId)

    if (!sessionId.success) {
      return applySettingsSessionCookies(context, createInvalidRequestResponse())
    }

    const upstreamResponse = await context.client.revokeActiveSession(sessionId.data, {
      accessToken: context.session.accessToken,
    })

    if (upstreamResponse.status !== 204) {
      return applySettingsSessionCookies(context, createUpstreamErrorResponse("revoke-session", upstreamResponse))
    }

    const response = createSuccessResponse()
    context.applySessionCookies(response)
    return response
  } catch (error) {
    return createUnexpectedRouteErrorResponse("revoke-session", error)
  }
}
