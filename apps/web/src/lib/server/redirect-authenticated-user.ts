import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { resolveServerSession } from "./session"

/**
 * Evita que uma sessão já válida volte a fluxos de entrada, como login,
 * cadastro e recuperação. Se o access token expirou, a área protegida assume
 * a renovação pelo BFF antes de decidir entre liberar a aplicação ou login.
 */
async function redirectAuthenticatedUser(): Promise<void> {
  const cookieStore = await cookies()
  const session = await resolveServerSession({ cookieReader: cookieStore })

  if (session.state === "authenticated" || session.state === "refresh-required") {
    redirect("/app")
  }
}

export { redirectAuthenticatedUser }
