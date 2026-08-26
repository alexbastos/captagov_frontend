"use client"

import { useEffect, useState } from "react"

type ProfileAvatarProps = {
  name: string
  src: string
}

function ProfileAvatar({ name, src }: ProfileAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [src])

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()

  if (src && !imageFailed) {
    return <img alt="Foto de perfil" className="size-16 rounded-full border border-capta-border-default object-cover" onError={() => setImageFailed(true)} src={src} />
  }

  return <span aria-label="Foto de perfil indisponível" className="flex size-16 items-center justify-center rounded-full bg-capta-brand-primary text-ui-semibold text-capta-text-inverse">{initials || "U"}</span>
}

export { ProfileAvatar }
