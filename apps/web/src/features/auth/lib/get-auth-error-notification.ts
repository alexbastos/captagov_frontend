import type { AuthBffError } from "../types/auth"

type AuthErrorNotification = {
  description: string
  title: string
}

function getAuthErrorNotification(error: AuthBffError): AuthErrorNotification {
  switch (error.code) {
    case "ACCOUNT_REQUIRES_ACTION":
      return { description: error.message, title: "Sua conta precisa de atenção" }
    case "INVALID_CREDENTIALS":
      return { description: error.message, title: "Não foi possível entrar" }
    case "INVALID_RECOVERY_LINK":
      return { description: error.message, title: "Link inválido ou expirado" }
    case "INVALID_VERIFICATION_LINK":
      return { description: error.message, title: "Link de confirmação inválido" }
    case "RATE_LIMITED":
      return { description: error.message, title: "Muitas tentativas" }
    case "REGISTRATION_CONFLICT":
      return { description: error.message, title: "Esta conta já existe" }
    case "VALIDATION_ERROR":
      return { description: error.message, title: "Revise os dados informados" }
    case "NETWORK_ERROR":
    case "SERVICE_UNAVAILABLE":
      return { description: error.message, title: "Serviço indisponível" }
    case "SOCIAL_AUTH_FAILED":
      return { description: error.message, title: "Não foi possível entrar com Google" }
    default:
      return { description: error.message, title: "Não foi possível concluir a solicitação" }
  }
}

export { getAuthErrorNotification }
