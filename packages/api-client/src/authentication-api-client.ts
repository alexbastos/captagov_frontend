import type { paths } from "./generated/authentication-api"
import { ApiHttpClient } from "./http-client"

const REGISTER_PATH = "/authentication_api/api/v1/auth/register" as const
const LOGIN_PATH = "/authentication_api/api/v1/auth/login" as const
const SOCIAL_LOGIN_PATH = "/authentication_api/api/v1/auth/login/social" as const
const VERIFY_EMAIL_PATH = "/authentication_api/api/v1/auth/verify-email" as const
const FORGOT_PASSWORD_PATH = "/authentication_api/api/v1/auth/forgot-password" as const
const RESET_PASSWORD_PATH = "/authentication_api/api/v1/auth/reset-password" as const
const RESEND_VERIFICATION_PATH = "/authentication_api/api/v1/auth/resend-verification" as const
const REFRESH_PATH = "/authentication_api/api/v1/auth/refresh" as const
const LOGOUT_PATH = "/authentication_api/api/v1/auth/logout" as const
const CURRENT_USER_PATH = "/authentication_api/api/v1/users/me" as const

type AuthenticationPath = keyof paths

type JsonPostRequest<Path extends AuthenticationPath> = paths[Path] extends {
  post: { requestBody: { content: { "application/json": infer Body } } }
}
  ? Body
  : never

type JsonResponse<Path extends AuthenticationPath, Method extends "get" | "post", Status extends number> =
  paths[Path] extends { [Key in Method]: { responses: infer Responses } }
    ? Responses extends Record<Status, infer Response>
      ? Response extends { content: { "application/json": infer Body } }
        ? Body
        : never
      : never
    : never

type RegisterInput = JsonPostRequest<typeof REGISTER_PATH>
type LoginInput = JsonPostRequest<typeof LOGIN_PATH>
type SocialLoginInput = JsonPostRequest<typeof SOCIAL_LOGIN_PATH>
type VerifyEmailInput = JsonPostRequest<typeof VERIFY_EMAIL_PATH>
type ForgotPasswordInput = JsonPostRequest<typeof FORGOT_PASSWORD_PATH>
type ResetPasswordInput = JsonPostRequest<typeof RESET_PASSWORD_PATH>
type ResendVerificationInput = JsonPostRequest<typeof RESEND_VERIFICATION_PATH>
type RefreshInput = JsonPostRequest<typeof REFRESH_PATH>
type LogoutInput = JsonPostRequest<typeof LOGOUT_PATH>

type RegisterResponse = JsonResponse<typeof REGISTER_PATH, "post", 201>
type LoginResponse = JsonResponse<typeof LOGIN_PATH, "post", 200>
type SocialLoginResponse = JsonResponse<typeof SOCIAL_LOGIN_PATH, "post", 200>
type VerifyEmailResponse = JsonResponse<typeof VERIFY_EMAIL_PATH, "post", 200>
type ForgotPasswordResponse = JsonResponse<typeof FORGOT_PASSWORD_PATH, "post", 200>
type ResetPasswordResponse = JsonResponse<typeof RESET_PASSWORD_PATH, "post", 200>
type ResendVerificationResponse = JsonResponse<typeof RESEND_VERIFICATION_PATH, "post", 200>
type RefreshResponse = JsonResponse<typeof REFRESH_PATH, "post", 200>
type CurrentUserResponse = JsonResponse<typeof CURRENT_USER_PATH, "get", 200>

type RequestOptions = {
  signal?: AbortSignal
}

type AuthenticatedRequestOptions = RequestOptions & {
  accessToken: string
}

type LogoutRequest = AuthenticatedRequestOptions & {
  refreshToken?: LogoutInput["refreshToken"]
}

/**
 * Fachada dos endpoints da Authentication API, destinada exclusivamente ao BFF.
 * Tokens são recebidos por argumento e nunca são persistidos neste pacote.
 */
class AuthenticationApiClient {
  constructor(private readonly httpClient: ApiHttpClient) {}

  register(input: RegisterInput, options: RequestOptions = {}) {
    return this.httpClient.request({
      body: input,
      method: "post",
      path: REGISTER_PATH,
      signal: options.signal,
    })
  }

  login(input: LoginInput, options: RequestOptions = {}) {
    return this.httpClient.request({
      body: input,
      method: "post",
      path: LOGIN_PATH,
      signal: options.signal,
    })
  }

  socialLogin(input: SocialLoginInput, options: RequestOptions = {}) {
    return this.httpClient.request({
      body: input,
      method: "post",
      path: SOCIAL_LOGIN_PATH,
      signal: options.signal,
    })
  }

  verifyEmail(input: VerifyEmailInput, options: RequestOptions = {}) {
    return this.httpClient.request({
      body: input,
      method: "post",
      path: VERIFY_EMAIL_PATH,
      signal: options.signal,
    })
  }

  forgotPassword(input: ForgotPasswordInput, options: RequestOptions = {}) {
    return this.httpClient.request({
      body: input,
      method: "post",
      path: FORGOT_PASSWORD_PATH,
      signal: options.signal,
    })
  }

  resetPassword(input: ResetPasswordInput, options: RequestOptions = {}) {
    return this.httpClient.request({
      body: input,
      method: "post",
      path: RESET_PASSWORD_PATH,
      signal: options.signal,
    })
  }

  resendVerification(input: ResendVerificationInput, options: RequestOptions = {}) {
    return this.httpClient.request({
      body: input,
      method: "post",
      path: RESEND_VERIFICATION_PATH,
      signal: options.signal,
    })
  }

  refresh(input: RefreshInput, options: RequestOptions = {}) {
    return this.httpClient.request({
      body: input,
      method: "post",
      path: REFRESH_PATH,
      signal: options.signal,
    })
  }

  logout(options: LogoutRequest) {
    return this.httpClient.request({
      body: options.refreshToken === undefined ? {} : { refreshToken: options.refreshToken },
      headers: authorizationHeader(options.accessToken),
      method: "post",
      path: LOGOUT_PATH,
      signal: options.signal,
    })
  }

  getCurrentUser(options: AuthenticatedRequestOptions) {
    return this.httpClient.request({
      headers: authorizationHeader(options.accessToken),
      method: "get",
      path: CURRENT_USER_PATH,
      signal: options.signal,
    })
  }
}

function authorizationHeader(accessToken: string): HeadersInit {
  if (!accessToken.trim()) {
    throw new Error("accessToken must not be empty")
  }

  return { authorization: `Bearer ${accessToken}` }
}

export { AuthenticationApiClient }
export type {
  AuthenticatedRequestOptions,
  CurrentUserResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  LoginInput,
  LoginResponse,
  LogoutRequest,
  RefreshInput,
  RefreshResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
  ResendVerificationInput,
  SocialLoginInput,
  SocialLoginResponse,
  RegisterInput,
  RegisterResponse,
  RequestOptions,
  ResendVerificationResponse,
  VerifyEmailInput,
  VerifyEmailResponse,
}
