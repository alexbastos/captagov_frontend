"use client"

import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { PasswordInputField } from "@/components/ui/password-input-field"

import { AuthNavLink } from "../navigation/auth-nav-link"
import { useResetPasswordFormEntrance } from "../../hooks/animations/use-reset-password-form-entrance"
import { useResetPassword } from "../../hooks/use-reset-password"

type ResetPasswordFormProps = {
  token?: string
}

function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { form, isSubmitting, onSubmit } = useResetPassword(token)
  const formRef = useRef<HTMLElement>(null)

  useResetPasswordFormEntrance(formRef)

  return (
    <section ref={formRef} className="mx-auto w-full max-w-sm space-y-4">
      <header className="space-y-2" data-reset-password-step>
        <h1 className="text-heading-4 text-capta-text-primary">Redefina sua senha</h1>
        <p className="text-ui text-capta-text-secondary">
          Crie uma nova senha para recuperar o acesso à sua conta.
        </p>
      </header>

      <form className="space-y-4" noValidate onSubmit={onSubmit}>
        <div data-reset-password-step>
          <PasswordInputField
            {...form.register("password")}
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            label="Nova senha"
            placeholder="Digite sua nova senha"
            required
          />
        </div>
        <div data-reset-password-step>
          <PasswordInputField
            {...form.register("confirmPassword")}
            autoComplete="new-password"
            error={form.formState.errors.confirmPassword?.message}
            label="Confirmar nova senha"
            placeholder="Confirme sua nova senha"
            required
          />
        </div>
        <div data-reset-password-step>
          <Button className="w-full" loading={isSubmitting} type="submit">
            Redefinir senha
          </Button>
        </div>
      </form>

      <p className="text-center text-ui text-capta-text-secondary" data-reset-password-step>
        Lembrou sua senha?{" "}
        <AuthNavLink className="font-semibold text-capta-text-primary" href="/login">
          Entrar
        </AuthNavLink>
      </p>
    </section>
  )
}

export { ResetPasswordForm }
export type { ResetPasswordFormProps }
