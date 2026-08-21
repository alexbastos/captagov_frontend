import type { ReactNode } from "react"

import { AuthPageShell } from "@/features/auth/components/shell/auth-page-shell"

type AuthLayoutProps = {
  children: ReactNode
}

/**
 * Mantém o stage de autenticação montado entre os fluxos públicos.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthPageShell>{children}</AuthPageShell>
}
