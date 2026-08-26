"use client"

import { ChangeEvent, useEffect, useState } from "react"

import { ProfileAvatar } from "./profile-avatar"

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png"]

type ProfileAvatarUploadProps = {
  name: string
  src: string
}

export function ProfileAvatarUpload({ name, src }: ProfileAvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setError("Selecione uma imagem PNG ou JPEG.")
      event.currentTarget.value = ""
      return
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError("A imagem deve ter no máximo 5 MB.")
      event.currentTarget.value = ""
      return
    }

    setError(null)
    setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
      <ProfileAvatar name={name} src={previewUrl ?? src} />
      <div className="min-w-0">
        <div className="flex flex-col items-start gap-2">
          <label className="motion-interactive inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-capta-border bg-transparent px-3 text-ui font-medium text-capta-text-primary hover:bg-capta-surface-muted focus-within:bg-capta-surface-subtle focus-within:outline-none">
            <input accept="image/jpeg,image/png" className="sr-only" onChange={handleFileChange} type="file" />
            Alterar foto
          </label>
          <p className="text-caption text-capta-text-secondary">PNG ou JPEG, até 5 MB.</p>
        </div>
        {previewUrl ? <p className="mt-2 text-caption text-capta-text-secondary" role="status">Prévia selecionada. O envio será habilitado quando a API de mídia estiver disponível.</p> : null}
        {error ? <p className="mt-2 text-caption text-[var(--color-feedback-error)]" role="alert">{error}</p> : null}
      </div>
    </div>
  )
}
