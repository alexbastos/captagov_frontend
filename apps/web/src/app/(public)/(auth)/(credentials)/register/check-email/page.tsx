import type { Metadata } from "next"
import { cookies } from "next/headers"

import { EmailVerificationSent } from "@/features/auth/components/status/email-verification-sent"
import { PENDING_VERIFICATION_EMAIL_COOKIE_NAME } from "@/lib/auth-constants"

export const metadata: Metadata = {
  title: "Verifique seu e-mail",
}

export default async function EmailVerificationSentPage() {
  const cookieStore = await cookies()
  const email = cookieStore.get(PENDING_VERIFICATION_EMAIL_COOKIE_NAME)?.value

  return <EmailVerificationSent email={email} />
}
