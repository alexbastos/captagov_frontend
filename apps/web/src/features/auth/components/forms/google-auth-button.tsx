import Image from "next/image"

import { Button } from "@/components/ui/button"

import { useGoogleAuth } from "../../hooks/use-google-auth"

type GoogleAuthButtonProps = {
  redirectTo?: string
}

function GoogleAuthButton({ redirectTo }: GoogleAuthButtonProps) {
  const { isSubmitting, signIn } = useGoogleAuth(redirectTo)

  return (
    <Button className="w-full" loading={isSubmitting} onClick={signIn} type="button" variant="secondary">
      <Image alt="" aria-hidden="true" className="size-5" height={20} src="/icons/google-g-logo.svg" width={20} />
      Continuar com Google
    </Button>
  )
}

export { GoogleAuthButton }
