import type { Metadata } from "next"

import { ForgotPasswordForm } from "@/features/auth/components/forms/forgot-password-form"
import { redirectAuthenticatedUser } from "@/lib/server/redirect-authenticated-user"

export const metadata: Metadata = {
  title: "Recuperar senha",
}

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser()

  return <ForgotPasswordForm />
}
