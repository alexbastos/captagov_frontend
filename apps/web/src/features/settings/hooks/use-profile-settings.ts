"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale, useTimeZone, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { formatBrazilianPhone, formatBrazilianPostalCode } from "@/lib/brazilian-input"
import { defaultLocale, defaultTimeZone, isAppLocale } from "@/i18n/config"
import { createProfileSchema, type ProfileValues } from "../schemas/profile.schema"
import { settingsBffClient } from "../services/settings-bff-client"
import type { SettingsUser } from "../types/settings"
import { useSettingsErrorMessage } from "./use-settings-error-message"

const PROFILE_QUERY_KEY = ["settings", "profile"] as const

const EMPTY_PROFILE_VALUES: ProfileValues = {
  avatarUrl: "",
  bio: "",
  birthDate: "",
  city: "",
  country: "",
  email: "",
  locale: defaultLocale,
  name: "",
  phone: "",
  state: "",
  street: "",
  timezone: "",
  zipCode: "",
}

function useProfileSettings() {
  const activeLocale = useLocale()
  const activeTimeZone = useTimeZone()
  const t = useTranslations("settings.profile")
  const tValidation = useTranslations("validation")
  const schema = useMemo(
    () => createProfileSchema({
      bioMax: tValidation("bioMax"),
      fullName: tValidation("fullName"),
      invalidDate: tValidation("invalidDate"),
      invalidEmail: tValidation("invalidEmail"),
      invalidPhone: tValidation("invalidPhone"),
      invalidPostalCode: tValidation("invalidPostalCode"),
      invalidTimeZone: tValidation("invalidTimeZone"),
      invalidUrl: tValidation("invalidUrl"),
    }),
    [tValidation],
  )
  const getSettingsErrorMessage = useSettingsErrorMessage()
  const queryClient = useQueryClient()
  const router = useRouter()
  const form = useForm<ProfileValues>({ defaultValues: EMPTY_PROFILE_VALUES, mode: "onChange", resolver: zodResolver(schema) })
  const profileQuery = useQuery({
    queryFn: async () => {
      const result = await settingsBffClient.getProfile()

      if (!result.ok) {
        throw new Error(getSettingsErrorMessage(result.error.code))
      }

      return result.data.user
    },
    queryKey: PROFILE_QUERY_KEY,
  })
  const updateMutation = useMutation({ mutationFn: settingsBffClient.updateProfile })
  const { isPending: isAvatarUploading, mutateAsync: uploadAvatarRequest } = useMutation({ mutationFn: settingsBffClient.uploadAvatar })
  const { isPending: isAvatarDeleting, mutateAsync: deleteAvatarRequest } = useMutation({ mutationFn: settingsBffClient.deleteAvatar })

  useEffect(() => {
    if (profileQuery.data) {
      form.reset(toProfileValues(profileQuery.data))
    }
  }, [form, profileQuery.data])

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await updateMutation.mutateAsync(values)

    if (!result.ok) {
      toast.error(t("saveError"), { description: getSettingsErrorMessage(result.error.code) })
      return
    }

    queryClient.setQueryData<SettingsUser>(PROFILE_QUERY_KEY, result.data.user)
    form.reset(toProfileValues(result.data.user))

    if (values.locale !== activeLocale || (values.timezone || defaultTimeZone) !== activeTimeZone) {
      router.refresh()
    }

    toast.success(t("saved"), { description: t("savedDescription") })
  })

  const applyAvatarUrl = useCallback((avatarUrl: string | null) => {
    form.resetField("avatarUrl", { defaultValue: avatarUrl ?? "" })
    queryClient.setQueryData<SettingsUser>(PROFILE_QUERY_KEY, (user) => user
      ? { ...user, profile: { ...user.profile, avatarUrl } }
      : user)
  }, [form, queryClient])

  const uploadAvatar = useCallback(async (avatar: File) => {
    const result = await uploadAvatarRequest(avatar)

    if (!result.ok) {
      toast.error(t("avatarUploadError"), { description: getSettingsErrorMessage(result.error.code) })
      return false
    }

    applyAvatarUrl(result.data.avatarUrl)
    toast.success(t("avatarUploaded"))
    return true
  }, [applyAvatarUrl, getSettingsErrorMessage, t, uploadAvatarRequest])

  const deleteAvatar = useCallback(async () => {
    const result = await deleteAvatarRequest()

    if (!result.ok) {
      toast.error(t("avatarDeleteError"), { description: getSettingsErrorMessage(result.error.code) })
      return false
    }

    applyAvatarUrl(null)
    toast.success(t("avatarDeleted"))
    return true
  }, [applyAvatarUrl, deleteAvatarRequest, getSettingsErrorMessage, t])

  return {
    deleteAvatar,
    form,
    isAvatarDeleting,
    isAvatarUploading,
    isLoading: profileQuery.isLoading,
    isSaving: updateMutation.isPending,
    loadError: profileQuery.error instanceof Error ? profileQuery.error.message : undefined,
    onSubmit,
    retry: profileQuery.refetch,
    uploadAvatar,
  }
}

function toProfileValues(user: SettingsUser): ProfileValues {
  const profileLocale = user.profile.locale

  return {
    avatarUrl: user.profile.avatarUrl ?? "",
    bio: user.profile.bio ?? "",
    birthDate: user.profile.birthDate ?? "",
    city: user.profile.address.city ?? "",
    country: user.profile.address.country ?? "",
    email: user.email,
    locale: profileLocale && isAppLocale(profileLocale) ? profileLocale : defaultLocale,
    name: user.name,
    phone: formatBrazilianPhone(user.profile.phone ?? ""),
    state: user.profile.address.state ?? "",
    street: user.profile.address.street ?? "",
    timezone: user.profile.timezone ?? "",
    zipCode: formatBrazilianPostalCode(user.profile.address.zipCode ?? ""),
  }
}

export { useProfileSettings }
