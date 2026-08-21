import type { Metadata } from "next"

import { LoginForm } from "@/features/auth/components/forms/login-form"

export const metadata: Metadata = {
  title: "Entrar",
}

type LoginPageProps = {
  searchParams: Promise<{ from?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { from } = await searchParams

  return <LoginForm redirectTo={typeof from === "string" ? from : undefined} />
}
