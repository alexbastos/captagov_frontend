"use client"

import { useTranslations } from "next-intl"
import { useCallback } from "react"

import type { AuthBffError } from "../types/auth"

type AuthErrorNotification = {
  description: string
  title: string
}

/**
 * Único seam entre códigos de erro de autenticação e copy localizada. Os
 * clientes HTTP e o BFF permanecem independentes de idioma.
 */
function useAuthErrorNotification() {
  const t = useTranslations("auth.notifications")

  return useCallback((error: AuthBffError): AuthErrorNotification => {
    switch (error.code) {
      case "ACCOUNT_REQUIRES_ACTION":
        return { description: t("accountRequiresAction.description"), title: t("accountRequiresAction.title") }
      case "INVALID_CREDENTIALS":
        return { description: t("invalidCredentials.description"), title: t("invalidCredentials.title") }
      case "INVALID_RECOVERY_LINK":
        return { description: t("invalidRecoveryLink.description"), title: t("invalidRecoveryLink.title") }
      case "INVALID_VERIFICATION_LINK":
        return { description: t("invalidVerificationLink.description"), title: t("invalidVerificationLink.title") }
      case "RATE_LIMITED":
        return { description: t("rateLimited.description"), title: t("rateLimited.title") }
      case "REGISTRATION_CONFLICT":
        return { description: t("registrationConflict.description"), title: t("registrationConflict.title") }
      case "VALIDATION_ERROR":
        return { description: t("validationError.description"), title: t("validationError.title") }
      case "NETWORK_ERROR":
      case "SERVICE_UNAVAILABLE":
        return { description: t("serviceUnavailable.description"), title: t("serviceUnavailable.title") }
      case "SOCIAL_AUTH_FAILED":
        return { description: t("socialAuthFailed.description"), title: t("socialAuthFailed.title") }
      default:
        return { description: t("requestFailed.description"), title: t("requestFailed.title") }
    }
  }, [t])
}

export { useAuthErrorNotification }
