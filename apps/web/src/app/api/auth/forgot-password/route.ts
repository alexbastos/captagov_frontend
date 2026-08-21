import {
  createInvalidRequestResponse,
  createSuccessResponse,
  createUnexpectedRouteErrorResponse,
  createUpstreamErrorResponse,
  ForgotPasswordRequestSchema,
  getAuthenticationRouteClient,
  parseJsonBody,
} from "@/lib/server/auth-bff-route"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const client = getAuthenticationRouteClient(request)
    const input = await parseJsonBody(request, ForgotPasswordRequestSchema)

    if (!input) {
      return createInvalidRequestResponse()
    }

    const upstreamResponse = await client.forgotPassword(input)

    if (upstreamResponse.status !== 200) {
      return createUpstreamErrorResponse("forgot-password", upstreamResponse)
    }

    return createSuccessResponse()
  } catch (error) {
    return createUnexpectedRouteErrorResponse("forgot-password", error)
  }
}
