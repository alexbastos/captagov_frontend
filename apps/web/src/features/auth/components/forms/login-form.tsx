"use client"

import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { PasswordInputField } from "@/components/ui/password-input-field"

import { AuthNavLink } from "../navigation/auth-nav-link"
import { GoogleAuthButton } from "./google-auth-button"
import { useLoginFormEntrance } from "../../hooks/animations/use-login-form-entrance"
import { useLoginEmailVerificationNotice } from "../../hooks/use-login-email-verification-notice"
import { useLogin } from "../../hooks/use-login"

type LoginFormProps = {
  redirectTo?: string
}

function LoginForm({ redirectTo }: LoginFormProps) {
  const { form, isSubmitting, onSubmit } = useLogin(redirectTo)
  const formRef = useRef<HTMLDivElement>(null)

  useLoginFormEntrance(formRef)
  useLoginEmailVerificationNotice()

  return (
    <div ref={formRef} className="space-y-4">
      <div className="space-y-2 text-center" data-login-step>
        <h1 className="text-heading-4 text-capta-text-primary">Bem-vindo de volta</h1>
        <p className="text-ui text-capta-text-secondary">Acesse sua conta para encontrar oportunidades para o seu município.</p>
      </div>

      <div data-login-step>
        <GoogleAuthButton redirectTo={redirectTo} />
      </div>

      <div aria-label="ou entre com e-mail e senha" className="flex items-center gap-3" data-login-step role="separator">
        <div className="h-px flex-1 bg-capta-border-default" />
        <span className="text-ui text-capta-text-secondary">ou entre com</span>
        <div className="h-px flex-1 bg-capta-border-default" />
      </div>

      <form className="space-y-4" noValidate onSubmit={onSubmit}>
        <div data-login-step>
          <InputField
            {...form.register("email")}
            autoComplete="email"
            error={form.formState.errors.email?.message}
            label="E-mail"
            required
            type="email"
          />
        </div>

        <div data-login-step>
          <PasswordInputField
            {...form.register("password")}
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            label="Senha"
            required
          />
        </div>

        <p className="text-right text-ui text-capta-text-secondary" data-login-step>
          <AuthNavLink className="font-semibold text-capta-text-primary" href="/forgot-password">
            Esqueceu sua senha?
          </AuthNavLink>
        </p>

        <div data-login-step>
          <Button className="w-full" loading={isSubmitting} type="submit">
            Entrar
          </Button>
        </div>
      </form>

      <p className="text-center text-ui text-capta-text-secondary" data-login-step>
        Ainda não possui uma conta?{" "}
        <AuthNavLink
          className="font-semibold text-capta-text-primary"
          href="/register"
        >
          Criar conta
        </AuthNavLink>
      </p>
    </div>
  )
}

export { LoginForm }
export type { LoginFormProps }
