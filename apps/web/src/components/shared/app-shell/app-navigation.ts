import { CircleHelp, House, Settings } from "lucide-react"

import type { AppNavigationItem } from "./types"

const homeNavigationItem: AppNavigationItem = {
  context: "Início",
  href: "/app",
  icon: House,
  label: "Início",
}

/**
 * Funcionalidades em preparação permanecem fora da navegação do MVP.
 * As respectivas rotas podem ser retomadas quando os fluxos estiverem prontos.
 */
const primaryNavigationItems: AppNavigationItem[] = []

const supportNavigationItems: AppNavigationItem[] = [
  { context: "Configurações", href: "/app/configuracoes", icon: Settings, label: "Configurações" },
  { context: "Ajuda", href: "/app/ajuda", icon: CircleHelp, label: "Ajuda" },
]

function getAppRouteContext(pathname: string): string {
  if (pathname === homeNavigationItem.href) {
    return homeNavigationItem.context
  }

  const navigationItem = [...primaryNavigationItems, ...supportNavigationItems].find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )

  return navigationItem?.context ?? "Aplicação"
}

export { getAppRouteContext, homeNavigationItem, primaryNavigationItems, supportNavigationItems }
