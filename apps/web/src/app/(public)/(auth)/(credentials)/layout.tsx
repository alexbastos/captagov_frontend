import type { ReactNode } from "react"

import { redirectAuthenticatedUser } from "@/lib/server/redirect-authenticated-user"

type CredentialsLayoutProps = {
  children: ReactNode
}

/** Páginas de entrada não devem ser apresentadas a uma sessão válida. */
export default async function CredentialsLayout({ children }: CredentialsLayoutProps) {
  await redirectAuthenticatedUser()

  return children
}
