"use client"

import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProfileSettings } from "../../hooks/use-profile-settings"
import { ProfileFormRow } from "../profile/profile-form-row"

function PreferencesSettingsPanel() {
  const { form, isLoading, isSaving, loadError, onSubmit, retry } = useProfileSettings()

  if (isLoading) {
    return <PreferencesPanelSkeleton />
  }

  if (loadError) {
    return (
      <div className="flex min-h-48 flex-col items-start justify-center gap-4 px-6 py-10 sm:px-8" role="alert">
        <p className="text-ui text-capta-text-secondary">Não foi possível carregar as preferências.</p>
        <Button onClick={() => retry()} size="sm" type="button" variant="secondary">
          <RefreshCw aria-hidden="true" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-8 px-6 pt-4 pb-8 sm:px-8" noValidate onSubmit={onSubmit}>
      <section aria-label="Preferências da conta">
        <ProfileFormRow error={form.formState.errors.locale?.message} label="Idioma" placeholder="pt-BR" registration={form.register("locale")} />
        <ProfileFormRow error={form.formState.errors.timezone?.message} label="Fuso horário" placeholder="America/Sao_Paulo" registration={form.register("timezone")} />
      </section>

      <div className="flex justify-end border-t pt-6">
        <Button loading={isSaving} type="submit">Salvar alterações</Button>
      </div>
    </form>
  )
}

function PreferencesPanelSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando preferências" className="space-y-4 px-6 py-8 sm:px-8">
      <div className="h-14 animate-pulse rounded bg-capta-surface-subtle" />
      <div className="h-14 animate-pulse rounded bg-capta-surface-subtle" />
    </div>
  )
}

export { PreferencesSettingsPanel }
