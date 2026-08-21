"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getAuthErrorNotification } from "../lib/get-auth-error-notification"
import { ResetPasswordSchema, type ResetPasswordValues } from "../schemas/reset-password.schema"
import { authBffClient } from "../services/auth-bff-client"

function useResetPassword(token: string | undefined) {
  const router = useRouter()
  const form = useForm<ResetPasswordValues>({
    defaultValues: { confirmPassword: "", password: "" },
    resolver: zodResolver(ResetPasswordSchema),
  })
  const mutation = useMutation({ mutationFn: authBffClient.resetPassword })

  const onSubmit = form.handleSubmit(async ({ password }) => {
    if (!token?.trim()) {
      toast.error("Não foi possível redefinir sua senha", {
        description: "Este link de recuperação é inválido ou expirou. Solicite um novo link.",
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
    toast.success("Senha redefinida", { description: "Agora você já pode entrar com sua nova senha." })
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
