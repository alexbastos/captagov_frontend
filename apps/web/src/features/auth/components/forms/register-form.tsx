"use client"

import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { PasswordInputField } from "@/components/ui/password-input-field"

import { AuthNavLink } from "../navigation/auth-nav-link"
import { GoogleAuthButton } from "./google-auth-button"
import { useRegisterFormEntrance } from "../../hooks/animations/use-register-form-entrance"
import { useRegister } from "../../hooks/use-register"

function RegisterForm() {
  const { form, isSubmitting, onSubmit } = useRegister()
  const formRef = useRef<HTMLDivElement>(null)

  useRegisterFormEntrance(formRef)

  return (
    <div ref={formRef} className="space-y-4">
      <div className="space-y-2 text-center" data-register-step>
        <h1 className="text-heading-4 text-capta-text-primary">Crie sua conta</h1>
        <p className="text-ui text-capta-text-secondary">Informe seus dados para começar a utilizar a plataforma.</p>
      </div>

      <div data-register-step>
        <GoogleAuthButton />
      </div>

      <div aria-label="ou entre com e-mail e senha" className="flex items-center gap-3" data-register-step role="separator">
        <div className="h-px flex-1 bg-capta-border-default" />
        <span className="text-ui text-capta-text-secondary">ou entre com</span>
        <div className="h-px flex-1 bg-capta-border-default" />
      </div>

      <form className="space-y-4" noValidate onSubmit={onSubmit}>
        <div data-register-step>
          <InputField
            {...form.register("name")}
            autoComplete="name"
            error={form.formState.errors.name?.message}
            label="Nome completo"
            placeholder="Digite seu nome"
            required
          />
        </div>

        <div data-register-step>
          <InputField
            {...form.register("email")}
            autoComplete="email"
            error={form.formState.errors.email?.message}
            label="E-mail"
            placeholder="Digite seu email"
            required
            type="email"
          />
        </div>

        <div data-register-step>
          <PasswordInputField
            {...form.register("password")}
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            label="Senha"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <div data-register-step>
          <Button className="w-full" loading={isSubmitting} type="submit">
            Criar conta
          </Button>
        </div>
      </form>

      <p className="text-center text-ui text-capta-text-secondary" data-register-step>
        Já possui uma conta?{" "}
        <AuthNavLink
          className="font-semibold text-capta-text-primary"
          href="/login"
        >
          Entrar
        </AuthNavLink>
      </p>
    </div>
  )
}

export { RegisterForm }
