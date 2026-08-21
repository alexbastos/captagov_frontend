"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

function useLoginEmailVerificationNotice() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasNotifiedRef = useRef(false)

  useEffect(() => {
    if (searchParams.get("verified") !== "1" || hasNotifiedRef.current) {
      return
    }

    hasNotifiedRef.current = true
    toast.success("E-mail confirmado", {
      description: "Sua conta foi ativada. Agora você já pode entrar.",
    })

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.delete("verified")
    const query = nextSearchParams.toString()

    router.replace(query ? `${pathname}?${query}` : pathname)
  }, [pathname, router, searchParams])
}

export { useLoginEmailVerificationNotice }
