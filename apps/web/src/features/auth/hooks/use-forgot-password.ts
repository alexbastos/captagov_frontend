"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { toast } from "sonner"

import { createForgotPasswordSchema, type ForgotPasswordValues } from "../schemas/forgot-password.schema"
import { authBffClient } from "../services/auth-bff-client"
import { useAuthErrorNotification } from "./use-auth-error-notification"

function useForgotPassword() {
  const tValidation = useTranslations("validation")
  const tNotifications = useTranslations("auth.notifications")
  const schema = useMemo(() => createForgotPasswordSchema(tValidation("invalidEmail")), [tValidation])
  const getAuthErrorNotification = useAuthErrorNotification()
  const form = useForm<ForgotPasswordValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(schema),
  })
  const mutation = useMutation({ mutationFn: authBffClient.forgotPassword })

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await mutation.mutateAsync(values)

    if (!result.ok) {
      const notification = getAuthErrorNotification(result.error)
      toast.error(notification.title, { description: notification.description })
      return
    }

    form.reset()
    toast.success(tNotifications("recoverySent.title"), {
      description: tNotifications("recoverySent.description"),
    })
  })

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit,
  }
}

export { useForgotPassword }
