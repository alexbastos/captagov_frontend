"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createResetPasswordSchema, type ResetPasswordValues } from "../schemas/reset-password.schema"
import { authBffClient } from "../services/auth-bff-client"
import { useAuthErrorNotification } from "./use-auth-error-notification"

function useResetPassword(token: string | undefined) {
  const t = useTranslations("validation")
  const tNotifications = useTranslations("auth.notifications")
  const schema = useMemo(() => createResetPasswordSchema({ lowercase: t("passwordLowercase"), min: t("passwordMin"), mismatch: t("passwordMismatch"), noSpaces: t("passwordNoSpaces"), number: t("passwordNumber"), special: t("passwordSpecial"), uppercase: t("passwordUppercase") }), [t])
  const getAuthErrorNotification = useAuthErrorNotification()
  const router = useRouter()
  const form = useForm<ResetPasswordValues>({
    defaultValues: { confirmPassword: "", password: "" },
    resolver: zodResolver(schema),
  })
  const mutation = useMutation({ mutationFn: authBffClient.resetPassword })

  const onSubmit = form.handleSubmit(async ({ password }) => {
    if (!token?.trim()) {
      toast.error(tNotifications("invalidRecoveryLink.title"), {
        description: tNotifications("invalidRecoveryLink.description"),
      })
      return
    }

    const result = await mutation.mutateAsync({ newPassword: password, token })

    if (!result.ok) {
      const notification = getAuthErrorNotification(result.error)
      toast.error(notification.title, { description: notification.description })
      return
    }

    form.reset()
    toast.success(tNotifications("passwordChanged.title"), { description: tNotifications("passwordChanged.description") })
    router.replace("/login")
    router.refresh()
  })

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit,
  }
}

export { useResetPassword }
