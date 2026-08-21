import type { HttpResult } from "./http-client"

type ApiErrorResponse = Pick<HttpResult<unknown>, "data" | "headers" | "status">

type AuthenticationErrorCode =
  | "BAD_REQUEST"
  | "CONFLICT"
  | "FORBIDDEN"
  | "NETWORK_ERROR"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "UNAUTHORIZED"

type NormalizedAuthenticationError = {
  code: AuthenticationErrorCode
  message: string
  retryable: boolean
  status: 400 | 401 | 403 | 409 | 429 | 503
}

type ApiErrorLogContext = {
  upstreamCode?: string
  upstreamError?: string
  upstreamRequestId?: string
  upstreamStatus?: number
}

const BAD_REQUEST: NormalizedAuthenticationError = {
  code: "BAD_REQUEST",
  message: "Revise os dados informados e tente novamente.",
  retryable: false,
  status: 400,
}

const UNAUTHORIZED: NormalizedAuthenticationError = {
  code: "UNAUTHORIZED",
  message: "Não foi possível autenticar esta solicitação.",
  retryable: false,
  status: 401,
}

const FORBIDDEN: NormalizedAuthenticationError = {
  code: "FORBIDDEN",
  message: "Esta solicitação não está disponível.",
  retryable: false,
  status: 403,
}

const CONFLICT: NormalizedAuthenticationError = {
  code: "CONFLICT",
  message: "Não foi possível concluir esta solicitação com os dados informados.",
  retryable: false,
  status: 409,
}

const RATE_LIMITED: NormalizedAuthenticationError = {
  code: "RATE_LIMITED",
  message: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
  retryable: true,
  status: 429,
}

const SERVICE_UNAVAILABLE: NormalizedAuthenticationError = {
  code: "SERVICE_UNAVAILABLE",
  message: "O serviço está indisponível no momento. Tente novamente em instantes.",
  retryable: true,
  status: 503,
}

const NETWORK_ERROR: NormalizedAuthenticationError = {
  code: "NETWORK_ERROR",
  message: "Não foi possível conectar ao serviço. Tente novamente em instantes.",
  retryable: true,
  status: 503,
}

/**
 * Produz exclusivamente dados seguros para uma resposta enviada ao navegador.
 *
 * Preserva a categoria HTTP recebida para que o BFF possa traduzi-la conforme
 * o fluxo. A camada do BFF continua responsável por não expor dados sensíveis.
 */
function normalizeAuthenticationError(error: unknown): NormalizedAuthenticationError {
  const response = asApiErrorResponse(error)

  if (!response) {
    return NETWORK_ERROR
  }

  if (response.status === 429) {
    return RATE_LIMITED
  }

  if (response.status >= 500) {
    return SERVICE_UNAVAILABLE
  }

  if (response.status === 400) {
    return BAD_REQUEST
  }

  if (response.status === 401) {
    return UNAUTHORIZED
  }

  if (response.status === 403) {
    return FORBIDDEN
  }

  if (response.status === 409) {
    return CONFLICT
  }

  return NETWORK_ERROR
}

/**
 * Dados mínimos para logs exclusivamente no servidor/BFF.
 * Nunca envie este objeto ao navegador: ele conserva somente metadados de
 * diagnóstico e deliberadamente descarta a mensagem e o corpo da requisição.
 */
function getApiErrorLogContext(error: unknown): ApiErrorLogContext {
  const response = asApiErrorResponse(error)

  if (!response) {
    return {}
  }

  const body = asRecord(response.data)

  return {
    upstreamCode: readString(body?.code),
    upstreamError: readString(body?.error),
    upstreamRequestId: response.headers.get("x-request-id") ?? undefined,
    upstreamStatus: response.status,
  }
}

function asApiErrorResponse(value: unknown): ApiErrorResponse | undefined {
  const record = asRecord(value)

  if (!record || typeof record.status !== "number" || !(record.headers instanceof Headers)) {
    return undefined
  }

  return {
    data: record.data,
    headers: record.headers,
    status: record.status,
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

export { getApiErrorLogContext, normalizeAuthenticationError }
export type { ApiErrorLogContext, NormalizedAuthenticationError }
