export { ApiHttpClient } from "./http-client"
export type { ApiHttpClientOptions, HttpResult, TypedApiRequest } from "./http-client"
export { AuthenticationApiClient } from "./authentication-api-client"
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
} from "./authentication-api-client"
export { getApiErrorLogContext, normalizeAuthenticationError } from "./error-normalizer"
export type { ApiErrorLogContext, NormalizedAuthenticationError } from "./error-normalizer"
