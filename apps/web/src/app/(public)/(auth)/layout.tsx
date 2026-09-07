import type { ReactNode } from "react"
import type { Metadata } from "next"

import { AuthPageShell } from "@/features/auth/components/shell/auth-page-shell"

export const metadata: Metadata = {
  robots: { follow: false, index: false },
}

type AuthLayoutProps = {
  children: ReactNode
}

/**
 * Mantém o stage de autenticação montado entre os fluxos públicos.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthPageShell>{children}</AuthPageShell>
}
