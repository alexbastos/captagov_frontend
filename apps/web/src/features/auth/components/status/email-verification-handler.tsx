"use client"

import { useRef, type RefObject } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { TriangleLoader } from "@/components/ui/triangle-loader"
import { cn } from "@/lib/utils"

import { useEmailVerificationHandlerEntrance } from "../../hooks/animations/use-email-verification-handler-entrance"
import { useVerifyEmail, type EmailVerificationState } from "../../hooks/use-verify-email"
import { AuthNavLink } from "../navigation/auth-nav-link"

type EmailVerificationHandlerProps = {
  token?: string
}

type VerificationContent = {
  description: string
  title: string
}

function getVerificationContent(state: EmailVerificationState): VerificationContent {
  if (state === "confirmed" || state === "exiting") {
    return {
      description: "Redirecionando para o login…",
      title: "Cadastro concluído",
    }
  }

  return {
    description: "Aguarde enquanto concluímos seu cadastro.",
    title: "Confirmando seu e-mail",
  }
}

function EmailVerificationHandler({ token }: EmailVerificationHandlerProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const { retry, state } = useVerifyEmail(token)

  useEmailVerificationHandlerEntrance({ scope: sectionRef, state })

  if (state === "resolving") {
    return (
      <section ref={sectionRef} aria-live="polite" className="sr-only" role="status">
        Validando o link de confirmação.
      </section>
    )
  }

  if (state === "invalid-link") {
    return <InvalidVerificationLink sectionRef={sectionRef} />
  }

  if (state === "unavailable") {
    return <UnavailableVerification sectionRef={sectionRef} onRetry={retry} />
  }

  const { description, title } = getVerificationContent(state)

  return (
    <section
      ref={sectionRef}
      aria-atomic="true"
      aria-busy={state === "confirming"}
      aria-live="polite"
      aria-labelledby="email-verification-handler-title"
      className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 text-center"
      role="status"
    >
      <div data-email-verification-handler-step>
        <TriangleLoader size={48} />
      </div>
      <header className="space-y-2" data-email-verification-handler-step>
        <h1 id="email-verification-handler-title" className="text-heading-4 text-capta-text-primary">
          {title}
        </h1>
        <p className="text-ui text-capta-text-secondary">{description}</p>
      </header>
    </section>
  )
}

function InvalidVerificationLink({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  return (
    <section ref={sectionRef} aria-labelledby="invalid-verification-link-title" className="mx-auto w-full max-w-sm space-y-4">
      <header className="space-y-2" data-email-verification-handler-step>
        <h1 id="invalid-verification-link-title" className="text-heading-4 text-capta-text-primary">
          Este link não é mais válido
        </h1>
        <p className="text-ui text-capta-text-secondary">
          O link de confirmação expirou ou já foi utilizado. Solicite um novo link para continuar.
        </p>
      </header>

      <div data-email-verification-handler-step>
        <AuthNavLink className={cn(buttonVariants({ className: "w-full" }))} href="/cadastro">
          Solicitar novo link
        </AuthNavLink>
      </div>

      <p className="text-center text-ui text-capta-text-secondary" data-email-verification-handler-step>
        Já possui uma conta?{" "}
        <AuthNavLink className="font-semibold text-capta-text-primary" href="/login">
          Entrar
        </AuthNavLink>
      </p>
    </section>
  )
}

function UnavailableVerification({
  onRetry,
  sectionRef,
}: {
  onRetry: () => Promise<void>
  sectionRef: RefObject<HTMLElement | null>
}) {
  return (
    <section ref={sectionRef} aria-labelledby="unavailable-verification-title" className="mx-auto w-full max-w-sm space-y-4">
      <header className="space-y-2" data-email-verification-handler-step>
        <h1 id="unavailable-verification-title" className="text-heading-4 text-capta-text-primary">
          Não foi possível confirmar seu e-mail
        </h1>
        <p className="text-ui text-capta-text-secondary">
          Não conseguimos concluir a confirmação agora. Tente novamente em instantes.
        </p>
      </header>

      <div data-email-verification-handler-step>
        <Button className="w-full" onClick={() => void onRetry()} type="button">
          Tentar novamente
        </Button>
      </div>

      <p className="text-center text-ui text-capta-text-secondary" data-email-verification-handler-step>
        <AuthNavLink className="font-semibold text-capta-text-primary" href="/login">
          Voltar para o login
        </AuthNavLink>
      </p>
    </section>
  )
}

export { EmailVerificationHandler }
export type { EmailVerificationHandlerProps }
