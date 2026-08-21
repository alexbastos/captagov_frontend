"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { getAuthErrorNotification } from "../lib/get-auth-error-notification"
import { getSafeAuthRedirect } from "../lib/get-safe-auth-redirect"
import { authBffClient } from "../services/auth-bff-client"
import { useLoginAuthenticationFlow } from "./use-login-authentication-flow"

const GOOGLE_IDENTITY_SERVICES_URL = "https://accounts.google.com/gsi/client"
const GOOGLE_SCOPE = "openid email profile"

let googleIdentityServicesPromise: Promise<void> | undefined

class GooglePopupError extends Error {
  constructor(readonly type: string) {
    super(type)
    this.name = "GooglePopupError"
  }
}

function useGoogleAuth(redirectTo?: string) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { awaitDestination, finishAuthentication, runAuthentication } = useLoginAuthenticationFlow()

  const signIn = useCallback(async () => {
    if (isSubmitting) {
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      toast.error("Login com Google indisponível", {
        description: "A configuração de login social ainda não está disponível.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await loadGoogleIdentityServices()
      const token = await requestGoogleAccessToken(clientId)

      const outcome = await runAuthentication(() =>
        authBffClient.socialLogin({ provider: "GOOGLE", token }),
      )

      if (outcome.type === "cancelled") {
        return
      }

      if (outcome.type === "error") {
        await finishAuthentication()
        toast.error("Não foi possível entrar com Google", {
          description: "Tente novamente em instantes.",
        })
        return
      }

      const result = outcome.result

      if (!result.ok) {
        await finishAuthentication()
        const notification = getAuthErrorNotification(result.error)
        toast.error(notification.title, { description: notification.description })
        return
      }

      awaitDestination()
      router.replace(getSafeAuthRedirect(redirectTo))
    } catch (error) {
      if (isGooglePopupClosedError(error)) {
        return
      }

      toast.error("Não foi possível entrar com Google", {
        description: "Tente novamente em instantes.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [awaitDestination, finishAuthentication, isSubmitting, redirectTo, router, runAuthentication])

  return { isSubmitting, signIn }
}

function loadGoogleIdentityServices(): Promise<void> {
  if (window.google?.accounts.oauth2) {
    return Promise.resolve()
  }

  googleIdentityServicesPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.async = true
    script.src = GOOGLE_IDENTITY_SERVICES_URL
    script.onload = () => (window.google?.accounts.oauth2 ? resolve() : reject())
    script.onerror = () => reject()
    document.head.append(script)
  })

  return googleIdentityServicesPromise
}

function requestGoogleAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google?.accounts.oauth2.initTokenClient({
      callback: (response) => {
        if (!response.access_token || response.error) {
          reject()
          return
        }

        resolve(response.access_token)
      },
      client_id: clientId,
      error_callback: (error) => reject(new GooglePopupError(error.type)),
      scope: GOOGLE_SCOPE,
    })

    if (!tokenClient) {
      reject()
      return
    }

    tokenClient.requestAccessToken({ prompt: "select_account" })
  })
}

function isGooglePopupClosedError(error: unknown): error is GooglePopupError {
  return error instanceof GooglePopupError && error.type === "popup_closed"
}

export { useGoogleAuth }
