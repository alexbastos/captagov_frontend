import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ResetPasswordForm } from "@/features/auth/components/forms/reset-password-form"

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Redefinir senha",
}

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams
  const resetToken = typeof token === "string" ? token.trim() : undefined

  if (!resetToken) {
    redirect("/esqueci-senha")
  }

  return <ResetPasswordForm token={resetToken} />
}
