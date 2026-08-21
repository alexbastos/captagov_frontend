import { ProtectedAreaUnavailable, ProtectedSessionRefreshGate } from "@/components/shared/protected-session-refresh-gate"
import { AppShell } from "@/components/shared/app-shell"
import { resolveServerSession } from "@/lib/server/session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Limite de segurança das rotas autenticadas. O proxy evita uma navegação
 * desnecessária sem cookie; este layout confirma a sessão com a API de
 * autenticação antes de liberar o conteúdo da área da aplicação.
 */
export default async function ProtectedAppLayout({ children }: LayoutProps<"/app">) {
  const cookieStore = await cookies()
  const session = await resolveServerSession({ cookieReader: cookieStore })

  if (session.state === "authenticated") {
    return <AppShell userName={session.user.name}>{children}</AppShell>
  }

  if (session.state === "refresh-required") {
    return <ProtectedSessionRefreshGate />
  }

  if (session.state === "unavailable") {
    return <ProtectedAreaUnavailable />
  }

  redirect("/login?from=%2Fapp")
}
