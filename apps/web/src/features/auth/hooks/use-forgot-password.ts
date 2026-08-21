"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getAuthErrorNotification } from "../lib/get-auth-error-notification"
import { ForgotPasswordSchema, type ForgotPasswordValues } from "../schemas/forgot-password.schema"
import { authBffClient } from "../services/auth-bff-client"

function useForgotPassword() {
  const form = useForm<ForgotPasswordValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(ForgotPasswordSchema),
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
    toast.success("Verifique seu e-mail", {
      description: "Se houver uma conta associada a este e-mail, enviaremos as instruções de recuperação.",
    })
  })

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit,
  }
}

export { useForgotPassword }
