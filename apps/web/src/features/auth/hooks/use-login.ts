"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getSafeAuthRedirect } from "../lib/get-safe-auth-redirect"
import { createLoginSchema, type LoginValues } from "../schemas/login.schema"
import { authBffClient } from "../services/auth-bff-client"
import { useLoginAuthenticationFlow } from "./use-login-authentication-flow"
import { useAuthErrorNotification } from "./use-auth-error-notification"

function useLogin(redirectTo: string | undefined) {
  const tValidation = useTranslations("validation")
  const tNotifications = useTranslations("auth.notifications")
  const schema = useMemo(() => createLoginSchema({ invalidEmail: tValidation("invalidEmail"), passwordMin: tValidation("passwordMin") }), [tValidation])
  const getAuthErrorNotification = useAuthErrorNotification()
  const router = useRouter()
  const form = useForm<LoginValues>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(schema),
  })
  const mutation = useMutation({ mutationFn: authBffClient.login })
  const { awaitDestination, finishAuthentication, runAuthentication } = useLoginAuthenticationFlow()

  const onSubmit = form.handleSubmit(async (values) => {
    const outcome = await runAuthentication(() => mutation.mutateAsync(values))

    if (outcome.type === "cancelled") {
      return
    }

    if (outcome.type === "error") {
      await finishAuthentication()
      toast.error(tNotifications("genericLogin.title"), { description: tNotifications("genericLogin.description") })
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
  })

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit,
  }
}

export { useLogin }
