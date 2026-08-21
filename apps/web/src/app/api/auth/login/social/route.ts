import {
  createInvalidRequestResponse,
  createSuccessResponse,
  createUnexpectedRouteErrorResponse,
  createUpstreamErrorResponse,
  getAuthenticationRouteClient,
  getLoginSessionTokens,
  parseJsonBody,
  SocialLoginRequestSchema,
} from "@/lib/server/auth-bff-route"
import { setSessionCookies } from "@/lib/server/session-cookies"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const client = getAuthenticationRouteClient(request)
    const input = await parseJsonBody(request, SocialLoginRequestSchema)

    if (!input) {
      return createInvalidRequestResponse()
    }

    const upstreamResponse = await client.socialLogin(input)
    const tokens = upstreamResponse.status === 200 ? getLoginSessionTokens(upstreamResponse.data) : undefined

    if (!tokens) {
      return createUpstreamErrorResponse("social-login", upstreamResponse)
    }

    const response = createSuccessResponse()
    setSessionCookies(response.cookies, tokens)

    return response
  } catch (error) {
    return createUnexpectedRouteErrorResponse("social-login", error)
  }
}
