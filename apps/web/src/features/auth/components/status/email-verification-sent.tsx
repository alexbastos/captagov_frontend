"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { cn } from "@/lib/utils"

import { useEmailVerificationSentEntrance } from "../../hooks/animations/use-email-verification-sent-entrance"
import { useAuthTransitionNav } from "../../hooks/animations/use-auth-transition-nav"
import { authBffClient } from "../../services/auth-bff-client"
import { AuthNavLink } from "../navigation/auth-nav-link"
import { useAuthTransition } from "../shell/auth-transition-provider"

type EmailVerificationSentProps = {
  email?: string
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@")

  if (local.length <= 2) {
    return `${local}*****@${domain}`
  }

  return `${local.slice(0, 2)}*****@${domain}`
}

function hasPendingVerificationEmail(email?: string): email is string {
  return typeof email === "string" && email.includes("@")
}

function EmailVerificationSent({ email }: EmailVerificationSentProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const { navigateWithExit } = useAuthTransitionNav()
  const { isTransitioning } = useAuthTransition()
  const [isResending, setIsResending] = useState(false)

  useEmailVerificationSentEntrance(sectionRef)

  const hasPendingEmail = hasPendingVerificationEmail(email)

  const handleResendEmail = async () => {
    if (!hasPendingVerificationEmail(email) || isResending) return
    setIsResending(true)

    try {
      const result = await authBffClient.resendVerification({ email })
      if (result.ok) {
        toast.success("Verifique seu e-mail", {
          description: "Se houver uma confirmação pendente para este endereço, enviaremos novas instruções.",
        })
      } else if (result.error.code === "RATE_LIMITED") {
        toast.info("Aguarde antes de solicitar outro envio", {
          description: "Para proteger sua conta, tente novamente em alguns minutos.",
        })
      } else {
        toast.error("Não foi possível solicitar um novo envio", {
          description: "Tente novamente em alguns instantes.",
        })
      }
    } catch {
      toast.error("Erro de conexão ao reenviar o e-mail.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <section ref={sectionRef} aria-labelledby="email-verification-sent-title" className="mx-auto w-full max-w-sm space-y-4">
      {hasPendingEmail ? (
        <>
          <header className="space-y-2" data-email-verification-step>
            <h1 id="email-verification-sent-title" className="text-heading-4 text-capta-text-primary">
              Verifique seu e-mail
            </h1>
            <p className="text-ui text-capta-text-secondary">
              Enviamos um link de confirmação de cadastro para o e-mail informado.
            </p>
          </header>

          <div data-email-verification-step>
            <InputField
              readOnly
              tabIndex={-1}
              wrapperClassName="pointer-events-none select-none bg-[var(--input-surface-disabled)] focus-within:border-[var(--input-border-default)]"
              label="E-mail"
              value={maskEmail(email)}
            />
          </div>

          <div data-email-verification-step>
            <Button
              className="w-full"
              disabled={isTransitioning}
              onClick={() => navigateWithExit("/login")}
              type="button"
            >
              Já confirmei meu e-mail
            </Button>
          </div>

          <p className="text-center text-ui text-capta-text-secondary" data-email-verification-step>
            Não recebeu?{" "}
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isResending}
              className="cursor-pointer font-semibold text-capta-text-primary motion-interactive hover:underline focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? "Reenviando..." : "Reenviar e-mail"}
            </button>
          </p>
        </>
      ) : (
        <>
          <header className="space-y-2" data-email-verification-step>
            <h1 id="email-verification-sent-title" className="text-heading-4 text-capta-text-primary">
              Confirme seu e-mail
            </h1>
            <p className="text-ui text-capta-text-secondary">
              Para ativar sua conta, acesse o link de confirmação enviado durante o cadastro.
            </p>
          </header>

          <div data-email-verification-step>
            <AuthNavLink className={cn(buttonVariants({ className: "w-full" }))} href="/login">
              Ir para login
            </AuthNavLink>
          </div>

          <p className="text-center text-ui text-capta-text-secondary" data-email-verification-step>
            Ainda não possui uma conta?{" "}
            <AuthNavLink className="font-semibold text-capta-text-primary" href="/register">
              Criar conta
            </AuthNavLink>
          </p>
        </>
      )}
    </section>
  )
}

export { EmailVerificationSent }
