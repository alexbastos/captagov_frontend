"use client"

import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"

import { AuthNavLink } from "../navigation/auth-nav-link"
import { useForgotPasswordFormEntrance } from "../../hooks/animations/use-forgot-password-form-entrance"
import { useForgotPassword } from "../../hooks/use-forgot-password"

function ForgotPasswordForm() {
  const { form, isSubmitting, onSubmit } = useForgotPassword()
  const formRef = useRef<HTMLElement>(null)

  useForgotPasswordFormEntrance(formRef)

  return (
    <section ref={formRef} className="mx-auto w-full max-w-sm space-y-4">
      <header className="space-y-2" data-forgot-password-step>
        <h1 className="text-heading-4 text-capta-text-primary">Recupere seu acesso</h1>
        <p className="text-ui text-capta-text-secondary">
          Informe o e-mail associado à sua conta. Enviaremos as instruções para redefinir sua senha.
        </p>
      </header>

      <form className="space-y-4" noValidate onSubmit={onSubmit}>
        <div data-forgot-password-step>
          <InputField
            {...form.register("email")}
            autoComplete="email"
            error={form.formState.errors.email?.message}
            label="E-mail"
            placeholder="Digite seu e-mail"
            required
            type="email"
          />
        </div>
        <div data-forgot-password-step>
          <Button className="w-full" loading={isSubmitting} type="submit">
            Enviar link de recuperação
          </Button>
        </div>
      </form>

      <p className="text-center text-ui text-capta-text-secondary" data-forgot-password-step>
        Lembrou sua senha?{" "}
        <AuthNavLink className="font-semibold text-capta-text-primary" href="/login">
          Entrar
        </AuthNavLink>
      </p>
    </section>
  )
}

export { ForgotPasswordForm }
