"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { QrCode } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef } from "react"

gsap.registerPlugin(useGSAP)

/** Painel de provisão TOTP, pronto para receber QR code e segredo temporário da API. */
function TwoFactorAuthenticationSetupPanel() {
  const t = useTranslations("settings.twoFactorAuthentication")
  const panelRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const panel = panelRef.current

    if (!panel) return undefined

    const media = gsap.matchMedia()
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.fromTo(panel, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, duration: 0.2, ease: "power2.out", y: 0 })

      return () => tween.kill()
    })
    media.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(panel, { autoAlpha: 1, y: 0 })
      return undefined
    })

    return () => media.revert()
  }, { scope: panelRef })

  return (
    <div aria-live="polite" className="border border-capta-border-default bg-capta-surface-subtle p-4" ref={panelRef}>
      <div className="flex items-start gap-4">
        <div aria-label={t("qrCodePlaceholderLabel")} className="flex size-20 shrink-0 items-center justify-center rounded-[var(--radius-token-md)] border border-capta-border-default bg-capta-surface-card text-capta-text-secondary" role="img">
          <QrCode aria-hidden="true" className="size-12" strokeWidth={1.5} />
        </div>
        <div>
          <h4 className="text-caption font-semibold text-capta-text-primary">{t("setupTitle")}</h4>
          <p className="mt-1 text-caption text-capta-text-secondary">{t("setupDescription")}</p>
          <p className="mt-2 text-caption text-capta-text-muted">{t("setupPending")}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-capta-border-default pt-4">
        <p className="text-caption font-semibold text-capta-text-primary">{t("verificationCode")}</p>
        <div aria-label={t("verificationCode")} aria-readonly="true" className="mt-2 flex gap-2" role="group">
          {Array.from({ length: 6 }, (_, index) => <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-[var(--radius-token-sm)] border border-capta-border-default bg-capta-surface-card text-caption text-capta-text-muted" key={index}>–</span>)}
        </div>
        <p className="mt-2 text-caption text-capta-text-muted">{t("verificationCodePending")}</p>
      </div>
    </div>
  )
}

export { TwoFactorAuthenticationSetupPanel }
