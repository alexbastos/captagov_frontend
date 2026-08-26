import {
  ChangePasswordRequestSchema,
  createInvalidRequestResponse,
  createSuccessResponse,
  createUnauthenticatedResponse,
  createUnexpectedRouteErrorResponse,
  createUpstreamErrorResponse,
  parseJsonBody,
} from "@/lib/server/auth-bff-route"
import { applySettingsSessionCookies, getAuthenticatedSettingsContext } from "@/lib/server/settings-bff-route"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function PUT(request: NextRequest) {
  try {
    const context = await getAuthenticatedSettingsContext(request)

    if (!context.session) {
      return applySettingsSessionCookies(context, createUnauthenticatedResponse())
    }

    const input = await parseJsonBody(request, ChangePasswordRequestSchema)

    if (!input) {
      return applySettingsSessionCookies(context, createInvalidRequestResponse())
    }

    const upstreamResponse = await context.client.changePassword(input, { accessToken: context.session.accessToken })

    if (upstreamResponse.status !== 200) {
      return applySettingsSessionCookies(context, createUpstreamErrorResponse("change-password", upstreamResponse))
    }

    const response = createSuccessResponse()
    context.applySessionCookies(response)
    return response
  } catch (error) {
    return createUnexpectedRouteErrorResponse("change-password", error)
  }
}
