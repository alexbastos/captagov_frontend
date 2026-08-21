import "server-only"

const DEFAULT_POST_AUTH_REDIRECT = "/app"
const INTERNAL_URL_BASE = "http://capta.internal"

class InvalidRequestOriginError extends Error {
  constructor() {
    super("The request origin is not trusted")
    this.name = "InvalidRequestOriginError"
  }
}

/**
 * Proteção CSRF complementar ao SameSite=Lax. Toda mutação do BFF deve chamá-la
 * antes de ler o corpo ou falar com a API remota. A ausência de Origin falha
 * fechada, pois estes handlers são destinados exclusivamente ao navegador.
 */
function assertTrustedRequestOrigin(request: Pick<Request, "headers">, expectedOrigin: string): void {
  if (request.headers.get("origin") !== expectedOrigin) {
    throw new InvalidRequestOriginError()
  }
}

/**
 * Converte uma intenção de retorno não confiável em um path interno seguro.
 * URLs absolutas, protocol-relative, barras invertidas e controles são sempre
 * descartados para impedir open redirects após login ou logout.
 */
function getSafeInternalRedirect(
  destination: string | null | undefined,
  fallback = DEFAULT_POST_AUTH_REDIRECT
): string {
  const decodedDestination = decodeDestination(destination)

  if (
    !destination ||
    !decodedDestination ||
    !destination.startsWith("/") ||
    decodedDestination.startsWith("//") ||
    /[\\\u0000-\u001F]/.test(decodedDestination)
  ) {
    return fallback
  }

  const parsedDestination = new URL(destination, INTERNAL_URL_BASE)

  if (parsedDestination.origin !== INTERNAL_URL_BASE) {
    return fallback
  }

  return `${parsedDestination.pathname}${parsedDestination.search}${parsedDestination.hash}`
}

function decodeDestination(destination: string | null | undefined): string | undefined {
  if (!destination) {
    return undefined
  }

  try {
    return decodeURIComponent(destination)
  } catch {
    return undefined
  }
}

export { assertTrustedRequestOrigin, DEFAULT_POST_AUTH_REDIRECT, getSafeInternalRedirect, InvalidRequestOriginError }
