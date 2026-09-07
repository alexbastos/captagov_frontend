"use client"

import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { type ChangeEvent, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { ProfileAvatar } from "./profile-avatar"

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png"]

type ProfileAvatarUploadProps = {
  isDeleting: boolean
  isUploading: boolean
  name: string
  onDelete: () => Promise<boolean>
  onUpload: (avatar: File) => Promise<boolean>
  src: string
}

export function ProfileAvatarUpload({ isDeleting, isUploading, name, onDelete, onUpload, src }: ProfileAvatarUploadProps) {
  const t = useTranslations("settings.profile")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setError(t("avatarTypeError"))
      input.value = ""
      return
    }

    if (file.size === 0) {
      setError(t("avatarEmptyError"))
      input.value = ""
      return
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError(t("avatarSizeError"))
      input.value = ""
      return
    }

    setError(null)
    setPreviewUrl(URL.createObjectURL(file))
    await onUpload(file)
    setPreviewUrl(null)
    input.value = ""
  }

  async function handleDelete() {
    const deleted = await onDelete()
    if (deleted) setPreviewUrl(null)
  }

  return (
    <div aria-busy={isDeleting || isUploading} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
      <ProfileAvatar name={name} src={previewUrl ?? src} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <label className="motion-interactive inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-capta-border bg-transparent px-3 text-ui font-medium text-capta-text-primary hover:bg-capta-surface-muted focus-within:bg-capta-surface-subtle focus-within:outline-none has-disabled:pointer-events-none has-disabled:opacity-50">
            <input accept="image/jpeg,image/png" className="sr-only" disabled={isDeleting || isUploading} onChange={handleFileChange} type="file" />
            {isUploading ? t("savingPhoto") : t("changePhoto")}
          </label>
          {src ? (
            <Button disabled={isDeleting || isUploading} loading={isDeleting} onClick={handleDelete} size="sm" type="button" variant="ghost">
              {!isDeleting ? <Trash2 aria-hidden="true" className="size-4" /> : null}
              {t("removePhoto")}
            </Button>
          ) : null}
        </div>
        <p className="mt-2 text-caption text-capta-text-secondary">{t("avatarHint")}</p>
        {previewUrl ? <p className="mt-2 text-caption text-capta-text-secondary" role="status">{t("avatarPreview")}</p> : null}
        {error ? <p className="mt-2 text-caption text-[var(--color-feedback-error)]" role="alert">{error}</p> : null}
      </div>
    </div>
  )
}
