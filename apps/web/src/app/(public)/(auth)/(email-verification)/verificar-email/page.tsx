import type { Metadata } from "next"

import { EmailVerificationHandler } from "@/features/auth/components/status/email-verification-handler"

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Confirmando e-mail",
}

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams

  return <EmailVerificationHandler token={typeof token === "string" ? token : undefined} />
}
