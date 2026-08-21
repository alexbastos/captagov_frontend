"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getAuthErrorNotification } from "../lib/get-auth-error-notification"
import { RegisterSchema, type RegisterValues } from "../schemas/register.schema"
import { authBffClient } from "../services/auth-bff-client"
import { useRegistrationConfirmationFlow } from "./animations/use-registration-confirmation-flow"

function useRegister() {
  const { startRegistrationConfirmation } = useRegistrationConfirmationFlow()
  const form = useForm<RegisterValues>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    resolver: zodResolver(RegisterSchema),
  })
  const mutation = useMutation({ mutationFn: authBffClient.register })

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await mutation.mutateAsync({
      email: values.email,
      name: values.name,
      password: values.password,
    })

    if (!result.ok) {
      const notification = getAuthErrorNotification(result.error)
      toast.error(notification.title, { description: notification.description })
      return
    }

    form.reset()
    startRegistrationConfirmation()
  })

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit,
  }
}

export { useRegister }
