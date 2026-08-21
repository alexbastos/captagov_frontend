import type { Metadata } from "next"

import { HomePage } from "@/features/home"

export const metadata: Metadata = {
  title: "Home",
}

/** Rota de entrada canônica após a autenticação. */
export default function ProtectedAppHomeRoute() {
  return <HomePage />
}
