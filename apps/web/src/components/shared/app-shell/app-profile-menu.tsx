"use client"

import { CircleHelp, LoaderCircle, LogOut, Settings, Settings2, ShieldCheck, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SlideMenu, type SlideMenuItem } from "@/components/ui/slide-menu"
import { authBffClient } from "@/features/auth/services/auth-bff-client"

import { useAppUser } from "./app-user-context"
import { HeaderProfileIndicator } from "./header-app"

const unavailableItem = () => toast.info("Em breve", { description: "Esta área ainda está sendo preparada." })

function getProfileMenuItems({ isLoggingOut, onLogout }: { isLoggingOut: boolean; onLogout: () => void }): SlideMenuItem[] {
  return [
    {
      children: [
        { icon: <UserRound aria-hidden="true" className="size-4" />, id: "profile-details", label: "Meu perfil", onSelect: unavailableItem },
        { icon: <ShieldCheck aria-hidden="true" className="size-4" />, id: "profile-security", label: "Segurança", onSelect: unavailableItem },
      ],
      icon: <UserRound aria-hidden="true" className="size-4" />,
      id: "account",
      label: "Minha conta",
    },
    {
      children: [
        { icon: <Settings2 aria-hidden="true" className="size-4" />, id: "preferences", label: "Preferências", onSelect: unavailableItem },
      ],
      icon: <Settings2 aria-hidden="true" className="size-4" />,
      id: "settings",
      label: "Configurações",
    },
    { icon: <CircleHelp aria-hidden="true" className="size-4" />, id: "help", label: "Ajuda", onSelect: unavailableItem },
    {
      disabled: isLoggingOut,
      icon: isLoggingOut ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <LogOut aria-hidden="true" className="size-4" />,
      id: "logout",
      label: isLoggingOut ? "Saindo..." : "Sair",
      onSelect: onLogout,
      separatorBefore: true,
      variant: "destructive",
    },
  ]
}

function AppProfileMenu({ initials }: { initials: string }) {
  const { name } = useAppUser()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [path, setPath] = useState<string[]>([])

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (!nextOpen) {
      setPath([])
    }
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    const result = await authBffClient.logout()

    if (!result.ok) {
      setIsLoggingOut(false)
      toast.error("Não foi possível sair", { description: "Tente novamente em instantes." })
      return
    }

    router.replace("/login")
  }

  const profileMenuItems = getProfileMenuItems({ isLoggingOut, onLogout: () => void handleLogout() })

  return (
    <DropdownMenu onOpenChange={handleOpenChange} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <HeaderProfileIndicator initials={initials} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-label="Menu da conta"
        className="w-[19.5rem] min-w-[19.5rem] overflow-hidden rounded-[1.125rem] border border-capta-border-default bg-capta-surface-card p-0 shadow-[0_1.25rem_2.5rem_rgb(23_23_23_/_12%)]"
        sideOffset={10}
      >
        {path.length === 0 ? (
          <ProfileMenuHeader initials={initials} name={name} onSettingsClick={() => setPath(["settings"])} />
        ) : null}
        <SlideMenu hideScrollbar items={profileMenuItems} onPathChange={setPath} path={path} rootLabel="Menu da conta" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type ProfileMenuHeaderProps = {
  initials: string
  name: string
  onSettingsClick: () => void
}

function ProfileMenuHeader({ initials, name, onSettingsClick }: ProfileMenuHeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b border-capta-border-default px-5 py-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-capta-brand-secondary text-ui font-bold text-capta-text-inverse">
        {initials.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-ui-semibold text-capta-text-primary">{name}</p>
        <p className="mt-1 text-ui text-capta-text-secondary">Gerenciar sua conta</p>
      </div>
      <button
        aria-label="Abrir configurações"
        className="motion-interactive flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-capta-text-secondary outline-none hover:bg-capta-surface-subtle hover:text-capta-text-primary focus-visible:ring-2 focus-visible:ring-capta-border-focus"
        onClick={onSettingsClick}
        type="button"
      >
        <Settings aria-hidden="true" className="size-[1.125rem]" />
      </button>
    </header>
  )
}

export { AppProfileMenu }
