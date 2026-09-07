"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { TwoFactorAuthenticationMethod } from "./two-factor-authentication-method"
import { TwoFactorAuthenticationSetupPanel } from "./two-factor-authentication-setup-panel"
import { useTwoFactorAuthentication } from "./use-two-factor-authentication"

type TwoFactorAuthenticationPanelProps = {
  isActive: boolean
}

/**
 * MÃ³dulo raiz de autenticaÃ§Ã£o em duas etapas.
 * O fluxo visual TOTP serÃ¡ composto aqui nas prÃ³ximas etapas.
 */
function TwoFactorAuthenticationPanel({ isActive }: TwoFactorAuthenticationPanelProps) {
  const t = useTranslations("settings.twoFactorAuthentication")
  const { beginConfiguration, beginSetup, cancelSetup, status } = useTwoFactorAuthentication()
  const isSettingUp = status === "setting-up"
  const isConfigurationVisible = status !== "disabled"

  if (!isActive) return null

  return (
    <section aria-labelledby="two-factor-authentication-title" className="border-t border-capta-border-default px-6 py-6 sm:px-8" data-settings-two-factor-authentication-group>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-ui-semibold text-capta-text-primary" id="two-factor-authentication-title">{t("title")}</h3>
          <p className="mt-1 max-w-xs text-ui text-capta-text-secondary">{t("description")}</p>
        </div>

        <Button className="!h-7 px-2 text-caption font-semibold" onClick={isConfigurationVisible ? cancelSetup : beginConfiguration} size="sm" type="button" variant="secondary">
          {isConfigurationVisible ? t("back") : t("configureAction")}
        </Button>
      </div>

      {isConfigurationVisible ? (
        <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] md:items-start">
          <div>
            <TwoFactorAuthenticationMethod isEnabled={isSettingUp} label={t("authenticatorApp")} onToggle={isSettingUp ? cancelSetup : beginSetup} toggleLabel={t("toggleAuthenticatorApp")} />
          </div>
          {isSettingUp ? <TwoFactorAuthenticationSetupPanel /> : null}
        </div>
      ) : null}
    </section>
  )
}

export { TwoFactorAuthenticationPanel }
