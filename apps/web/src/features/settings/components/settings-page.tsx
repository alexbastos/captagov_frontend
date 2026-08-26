"use client"

import { Activity, ShieldCheck, SlidersHorizontal, UserRound, type LucideIcon } from "lucide-react"
import { useId, useRef, useState, type KeyboardEvent, type RefObject } from "react"

import { Card } from "@/components/ui/card"
import { useUnsavedChangesGuard } from "@/components/shared/app-shell/unsaved-changes-guard"
import { cn } from "@/lib/utils"

import { ProfileSettingsPanel } from "./profile/profile-settings-panel"
import { PreferencesSettingsPanel } from "./preferences/preferences-settings-panel"
import { SettingsPageMotion } from "./settings-page-motion"

type SettingsSection = "activity" | "preferences" | "profile" | "security"

type SettingsSectionDefinition = {
  description: string
  icon: LucideIcon
  id: SettingsSection
  label: string
  pendingDescription: string
  title: string
}

const settingsSections: SettingsSectionDefinition[] = [
  {
    description: "Dados pessoais e informações do seu perfil.",
    icon: UserRound,
    id: "profile",
    label: "Perfil",
    pendingDescription: "A edição dos dados do seu perfil será disponibilizada na próxima etapa.",
    title: "Perfil",
  },
  {
    description: "Senha, dispositivos ativos e contas conectadas.",
    icon: ShieldCheck,
    id: "security",
    label: "Segurança",
    pendingDescription: "Os controles de senha, sessões e conexões serão disponibilizados em breve.",
    title: "Segurança",
  },
  {
    description: "Idioma, fuso hor\u00e1rio e prefer\u00eancias da sua conta.",
    icon: SlidersHorizontal,
    id: "preferences",
    label: "Prefer\u00eancias",
    pendingDescription: "As prefer\u00eancias da conta ser\u00e3o disponibilizadas em breve.",
    title: "Prefer\u00eancias",
  },
  {
    description: "Histórico recente de acessos à sua conta.",
    icon: Activity,
    id: "activity",
    label: "Atividade",
    pendingDescription: "O histórico de acessos será disponibilizado em uma etapa posterior.",
    title: "Atividade",
  },
]

/** Casca da área de configurações; cada seção ganha seu conteúdo em uma etapa própria. */
function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")
  const { requestNavigation } = useUnsavedChangesGuard()
  const tabListId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  function moveTabFocus(currentIndex: number, event: KeyboardEvent<HTMLButtonElement>) {
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0

    if (!direction) {
      return
    }

    event.preventDefault()
    const nextIndex = (currentIndex + direction + settingsSections.length) % settingsSections.length
    const nextSection = settingsSections[nextIndex]

    if (selectSection(nextSection.id)) {
      tabRefs.current[nextIndex]?.focus()
    }
  }

  function selectSection(section: SettingsSection) {
    if (section === activeSection) {
      return true
    }

    return requestNavigation(() => setActiveSection(section))
  }

  return (
    <SettingsPageMotion>
      <header data-settings-page-header className="max-w-2xl space-y-1">
        <h1 className="font-heading text-[1.375rem] leading-[1.3] font-semibold tracking-[-0.02em] text-capta-text-primary">
          Configurações
        </h1>
        <p className="text-ui text-capta-text-secondary">Gerencie seu perfil, acesso e segurança da conta.</p>
      </header>

      <div className="mt-8 flex min-h-0 flex-1 flex-col gap-6 md:mt-10 md:flex-row md:gap-8">
        <SettingsNavigation
          activeSection={activeSection}
          onKeyDown={moveTabFocus}
          onSelect={selectSection}
          tabListId={tabListId}
          tabRefs={tabRefs}
        />

        <Card data-settings-page-content className="min-h-72 flex-1 !gap-0 !p-0">
          {settingsSections.map((section) => (
            <section
              aria-labelledby={`${tabListId}-${section.id}-tab`}
              hidden={section.id !== activeSection}
              id={`${tabListId}-${section.id}-panel`}
              key={section.id}
              role="tabpanel"
            >
              <div className="px-6 py-6 sm:px-8">
                <h2 className="font-heading text-[1.125rem] leading-[1.3] font-semibold tracking-[-0.02em] text-capta-text-primary">{section.title}</h2>
                <p className="mt-1 max-w-xl text-ui text-capta-text-secondary">{section.description}</p>
              </div>

              {section.id === "profile" ? <ProfileSettingsPanel /> : null}
              {section.id === "preferences" ? <PreferencesSettingsPanel /> : null}
              {section.id !== "profile" && section.id !== "preferences" ? (
                <div className="flex min-h-48 items-center px-6 py-10 sm:px-8">
                  <p className="max-w-md text-ui text-capta-text-muted">{section.pendingDescription}</p>
                </div>
              ) : null}
            </section>
          ))}
        </Card>
      </div>
    </SettingsPageMotion>
  )
}

type SettingsNavigationProps = {
  activeSection: SettingsSection
  onKeyDown: (currentIndex: number, event: KeyboardEvent<HTMLButtonElement>) => void
  onSelect: (section: SettingsSection) => boolean
  tabListId: string
  tabRefs: RefObject<Array<HTMLButtonElement | null>>
}

function SettingsNavigation({ activeSection, onKeyDown, onSelect, tabListId, tabRefs }: SettingsNavigationProps) {
  return (
    <nav
      aria-label="Seções de configurações"
      data-settings-navigation
      className="-mx-6 overflow-x-auto px-6 pb-1 sm:-mx-8 sm:px-8 md:mx-0 md:w-52 md:shrink-0 md:self-start md:overflow-visible md:p-0"
    >
      <div className="flex min-w-max gap-2 md:flex-col" role="tablist">
        {settingsSections.map((section, index) => {
          const Icon = section.icon
          const isActive = section.id === activeSection

          return (
            <button
              aria-controls={`${tabListId}-${section.id}-panel`}
              aria-selected={isActive}
              className={cn(
                "motion-interactive flex h-10 cursor-pointer items-center gap-3 rounded-[var(--radius-token-lg)] px-3 text-left text-[0.8125rem] leading-[var(--type-ui-line-height)] font-normal text-capta-text-secondary outline-none",
                "hover:bg-capta-surface-subtle hover:text-capta-text-primary focus-visible:ring-2 focus-visible:ring-capta-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-capta-surface-card",
                "md:w-full",
                isActive && "bg-capta-surface-default text-capta-text-primary",
              )}
              id={`${tabListId}-${section.id}-tab`}
              key={section.id}
              onClick={() => onSelect(section.id)}
              onKeyDown={(event) => onKeyDown(index, event)}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {section.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export { SettingsPage }
