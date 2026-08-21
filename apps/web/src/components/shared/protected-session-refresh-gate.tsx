"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type RefreshState = "checking" | "unavailable"

/**
 * Mantém o conteúdo protegido fora da tela enquanto o BFF renova uma sessão
 * cujo access token expirou. A renovação precisa ocorrer no Route Handler,
 * pois é ele que pode persistir os cookies HttpOnly rotacionados.
 */
function ProtectedSessionRefreshGate() {
  const router = useRouter()
  const [state, setState] = useState<RefreshState>("checking")

  useEffect(() => {
    let active = true

    async function refreshSession() {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "same-origin",
          method: "POST",
        })

        if (response.ok) {
          router.refresh()
          return
        }

        if (response.status === 401) {
          const from = `${window.location.pathname}${window.location.search}${window.location.hash}`
          router.replace(`/login?from=${encodeURIComponent(from)}`)
          return
        }

        if (active) {
          setState("unavailable")
        }
      } catch {
        if (active) {
          setState("unavailable")
        }
      }
    }

    void refreshSession()

    return () => {
      active = false
    }
  }, [router])

  if (state === "unavailable") {
    return <ProtectedAreaUnavailable />
  }

  return (
    <main aria-busy="true" aria-live="polite" className="flex min-h-dvh items-center justify-center px-6 py-12">
      <p className="text-ui text-capta-text-secondary">Verificando sua sessão…</p>
    </main>
  )
}

function ProtectedAreaUnavailable() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <section aria-labelledby="session-unavailable-title" className="w-full max-w-md space-y-3 text-center">
        <h1 id="session-unavailable-title" className="text-heading-4 text-capta-text-primary">
          Não foi possível verificar sua sessão
        </h1>
        <p className="text-ui text-capta-text-secondary">
          Tente novamente em alguns instantes. Se o problema persistir, entre em contato com o suporte.
        </p>
      </section>
    </main>
  )
}

export { ProtectedAreaUnavailable, ProtectedSessionRefreshGate }
