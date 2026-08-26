"use client"

import { RefreshCw } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { useUnsavedChangesGuard } from "@/components/shared/app-shell/unsaved-changes-guard"
import { formatBrazilianPhone, formatBrazilianPostalCode } from "@/lib/brazilian-input"
import { useProfileSettingsEntrance } from "../../hooks/animations/use-profile-settings-entrance"
import { usePostalCodeLookup } from "../../hooks/use-postal-code-lookup"
import { useProfileSettings } from "../../hooks/use-profile-settings"
import type { ProfileValues } from "../../schemas/profile.schema"
import { ProfileAvatarUpload } from "./profile-avatar-upload"
import { ProfileDateRow, ProfileFormRow, ProfileTextAreaRow } from "./profile-form-row"

function ProfileSettingsPanel() {
  const { form, isLoading, isSaving, loadError, onSubmit, retry } = useProfileSettings()
  const { registerUnsavedChangesHandler } = useUnsavedChangesGuard()
  const postalCodeLookup = usePostalCodeLookup(form)
  const formRef = useRef<HTMLFormElement>(null)

  useProfileSettingsEntrance(formRef, !isLoading && !loadError)

  const discardChanges = useCallback(() => form.reset(), [form])
  const hasUnsavedChanges = useCallback(() => form.formState.isDirty, [form.formState.isDirty])
  const getUnsavedChanges = useCallback(() => getProfileUnsavedChanges(form.getValues(), form.formState.dirtyFields, form.formState.defaultValues ?? {}), [form])

  useEffect(() => registerUnsavedChangesHandler({ discardChanges, getUnsavedChanges, hasUnsavedChanges }), [discardChanges, getUnsavedChanges, hasUnsavedChanges, registerUnsavedChangesHandler])

  useEffect(() => {
    if (!form.formState.isDirty) {
      return
    }

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", warnBeforeUnload)

    return () => window.removeEventListener("beforeunload", warnBeforeUnload)
  }, [form.formState.isDirty])

  if (isLoading) {
    return <ProfilePanelSkeleton />
  }

  if (loadError) {
    return (
      <div className="flex min-h-48 flex-col items-start justify-center gap-4 px-6 py-10 sm:px-8" role="alert">
        <div className="space-y-1">
          <h3 className="text-ui-semibold text-capta-text-primary">Não foi possível carregar o perfil</h3>
          <p className="text-ui text-capta-text-secondary">{loadError}</p>
        </div>
        <Button onClick={() => retry()} size="sm" type="button" variant="secondary">
          <RefreshCw aria-hidden="true" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <form ref={formRef} className="space-y-8 px-6 pt-4 pb-8 sm:px-8" noValidate onSubmit={onSubmit}>
      <section aria-labelledby="profile-personal-information" className="space-y-4" data-settings-profile-group>
        <h3 className="text-ui-semibold text-capta-text-primary" id="profile-personal-information">
          Informações pessoais
        </h3>

        <ProfileAvatarUpload name={form.watch("name")} src={form.watch("avatarUrl")} />

        <ProfileFormRow autoComplete="name" error={form.formState.errors.name?.message} label="Nome completo" placeholder="Informe seu nome completo" registration={form.register("name")} required />
        <ProfileFormRow autoComplete="email" editable={false} error={form.formState.errors.email?.message} label="E-mail" placeholder="E-mail vinculado à conta" registration={form.register("email")} required type="email" />
        <ProfileFormRow
          autoComplete="tel"
          error={form.formState.errors.phone?.message}
          formatValue={formatBrazilianPhone}
          inputMode="tel"
          label="Telefone"
          placeholder="(00) 00000-0000"
          registration={form.register("phone")}
          type="tel"
        />
        <ProfileDateRow
          error={form.formState.errors.birthDate?.message}
          label="Data de nascimento"
          onValueChange={(value) => form.setValue("birthDate", value, { shouldDirty: true, shouldValidate: true })}
          value={form.watch("birthDate")}
        />
        <ProfileTextAreaRow
          error={form.formState.errors.bio?.message}
          onValueChange={(value) => form.setValue("bio", value, { shouldDirty: true, shouldValidate: true })}
          value={form.watch("bio")}
        />
      </section>

      <section aria-labelledby="profile-location" className="space-y-4" data-settings-profile-group>
        <div>
          <h3 className="text-ui-semibold text-capta-text-primary" id="profile-location">Localização</h3>
          <p className="mt-1 text-ui text-capta-text-secondary">Informe seu endereço e a sua localização.</p>
        </div>

        <ProfileFormRow
          autoComplete="postal-code"
          description={postalCodeLookup.message}
          error={form.formState.errors.zipCode?.message}
          formatValue={formatBrazilianPostalCode}
          inputMode="numeric"
          label="CEP"
          onValueChange={postalCodeLookup.onPostalCodeChange}
          placeholder="00000-000"
          registration={form.register("zipCode")}
        />
        <ProfileFormRow autoComplete="street-address" error={form.formState.errors.street?.message} label="Endereço" placeholder="Informe seu endereço" registration={form.register("street")} />
        <ProfileFormRow autoComplete="address-level2" error={form.formState.errors.city?.message} label="Cidade" placeholder="Informe sua cidade" registration={form.register("city")} />
        <ProfileFormRow autoComplete="address-level1" error={form.formState.errors.state?.message} label="Estado" placeholder="Informe seu estado" registration={form.register("state")} />
        <ProfileFormRow autoComplete="country" error={form.formState.errors.country?.message} label="País" placeholder="BR" registration={form.register("country")} />
      </section>

      <div className="flex justify-end pt-6" data-settings-profile-group>
        <Button
          disabled={postalCodeLookup.status === "invalid" || postalCodeLookup.status === "loading" || Boolean(form.formState.errors.zipCode)}
          loading={isSaving}
          type="submit"
        >
          Salvar alterações
        </Button>
      </div>
    </form>
  )
}

const profileFieldLabels: Partial<Record<keyof ProfileValues, string>> = {
  bio: "Biografia",
  birthDate: "Data de nascimento",
  city: "Cidade",
  country: "País",
  name: "Nome completo",
  phone: "Telefone",
  state: "Estado",
  street: "Endereço",
  zipCode: "CEP",
}

function getProfileUnsavedChanges(
  values: ProfileValues,
  dirtyFields: Partial<Record<keyof ProfileValues, boolean>>,
  defaultValues: Partial<ProfileValues>,
) {
  return (Object.keys(profileFieldLabels) as Array<keyof ProfileValues>)
    .filter((field) => dirtyFields[field])
    .map((field) => ({ field, label: profileFieldLabels[field] ?? field, previousValue: defaultValues[field] ?? "", value: values[field] }))
}

function ProfilePanelSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando perfil" className="space-y-6 px-6 py-8 sm:px-8">
      <div className="h-5 w-40 animate-pulse rounded bg-capta-surface-subtle" />
      <div className="h-24 animate-pulse rounded-[var(--radius-token-lg)] bg-capta-surface-subtle" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-16 animate-pulse rounded-[var(--radius-token-lg)] bg-capta-surface-subtle" />
        <div className="h-16 animate-pulse rounded-[var(--radius-token-lg)] bg-capta-surface-subtle" />
      </div>
      <div className="h-28 animate-pulse rounded-[var(--radius-token-lg)] bg-capta-surface-subtle" />
    </div>
  )
}

export { ProfileSettingsPanel }
