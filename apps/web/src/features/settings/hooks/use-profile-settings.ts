"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { formatBrazilianPhone, formatBrazilianPostalCode } from "@/lib/brazilian-input"
import { ProfileSchema, type ProfileValues } from "../schemas/profile.schema"
import { settingsBffClient } from "../services/settings-bff-client"
import type { SettingsUser } from "../types/settings"

const PROFILE_QUERY_KEY = ["settings", "profile"] as const

const EMPTY_PROFILE_VALUES: ProfileValues = {
  avatarUrl: "",
  bio: "",
  birthDate: "",
  city: "",
  country: "",
  email: "",
  locale: "",
  name: "",
  phone: "",
  state: "",
  street: "",
  timezone: "",
  zipCode: "",
}

function useProfileSettings() {
  const queryClient = useQueryClient()
  const form = useForm<ProfileValues>({ defaultValues: EMPTY_PROFILE_VALUES, mode: "onChange", resolver: zodResolver(ProfileSchema) })
  const profileQuery = useQuery({
    queryFn: async () => {
      const result = await settingsBffClient.getProfile()

      if (!result.ok) {
        throw new Error(result.error.message)
      }

      return result.data.user
    },
    queryKey: PROFILE_QUERY_KEY,
  })
  const updateMutation = useMutation({ mutationFn: settingsBffClient.updateProfile })

  useEffect(() => {
    if (profileQuery.data) {
      form.reset(toProfileValues(profileQuery.data))
    }
  }, [form, profileQuery.data])

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await updateMutation.mutateAsync(values)

    if (!result.ok) {
      toast.error("Não foi possível salvar o perfil", { description: result.error.message })
      return
    }

    queryClient.setQueryData<SettingsUser>(PROFILE_QUERY_KEY, result.data.user)
    form.reset(toProfileValues(result.data.user))
    toast.success("Perfil atualizado", { description: "Suas informações foram salvas." })
  })

  return {
    form,
    isLoading: profileQuery.isLoading,
    isSaving: updateMutation.isPending,
    loadError: profileQuery.error instanceof Error ? profileQuery.error.message : undefined,
    onSubmit,
    retry: profileQuery.refetch,
  }
}

function toProfileValues(user: SettingsUser): ProfileValues {
  return {
    avatarUrl: user.profile.avatarUrl ?? "",
    bio: user.profile.bio ?? "",
    birthDate: user.profile.birthDate ?? "",
    city: user.profile.address.city ?? "",
    country: user.profile.address.country ?? "",
    email: user.email,
    locale: user.profile.locale ?? "",
    name: user.name,
    phone: formatBrazilianPhone(user.profile.phone ?? ""),
    state: user.profile.address.state ?? "",
    street: user.profile.address.street ?? "",
    timezone: user.profile.timezone ?? "",
    zipCode: formatBrazilianPostalCode(user.profile.address.zipCode ?? ""),
  }
}

export { useProfileSettings }
