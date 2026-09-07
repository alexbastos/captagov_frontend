import {
  createInvalidRequestResponse,
  createUnauthenticatedResponse,
  createUnexpectedRouteErrorResponse,
  createUpstreamErrorResponse,
} from "@/lib/server/auth-bff-route"
import {
  applySettingsSessionCookies,
  createSettingsResponse,
  getAuthenticatedSettingsContext,
} from "@/lib/server/settings-bff-route"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024
const MAX_MULTIPART_SIZE_BYTES = MAX_AVATAR_SIZE_BYTES + 64 * 1024
const ACCEPTED_AVATAR_TYPES = new Set(["image/jpeg", "image/png"])

export async function POST(request: NextRequest) {
  try {
    const context = await getAuthenticatedSettingsContext(request)

    if (!context.session) {
      return applySettingsSessionCookies(context, createUnauthenticatedResponse())
    }

    const avatar = await readAvatar(request)

    if (!avatar) {
      return applySettingsSessionCookies(context, createInvalidRequestResponse())
    }

    const upstreamResponse = await context.client.uploadCurrentUserAvatar(avatar, {
      accessToken: context.session.accessToken,
    })

    if (
      upstreamResponse.status !== 200 ||
      !upstreamResponse.data ||
      !("avatarUrl" in upstreamResponse.data) ||
      !upstreamResponse.data.avatarUrl
    ) {
      return applySettingsSessionCookies(context, createUpstreamErrorResponse("upload-avatar", upstreamResponse))
    }

    return createSettingsResponse(context, { avatarUrl: upstreamResponse.data.avatarUrl })
  } catch (error) {
    return createUnexpectedRouteErrorResponse("upload-avatar", error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const context = await getAuthenticatedSettingsContext(request)

    if (!context.session) {
      return applySettingsSessionCookies(context, createUnauthenticatedResponse())
    }

    const upstreamResponse = await context.client.deleteCurrentUserAvatar({
      accessToken: context.session.accessToken,
    })

    if (upstreamResponse.status !== 200 && upstreamResponse.status !== 404) {
      return applySettingsSessionCookies(context, createUpstreamErrorResponse("delete-avatar", upstreamResponse))
    }

    return createSettingsResponse(context, { avatarUrl: null })
  } catch (error) {
    return createUnexpectedRouteErrorResponse("delete-avatar", error)
  }
}

async function readAvatar(request: NextRequest): Promise<File | undefined> {
  const contentType = request.headers.get("content-type")
  const contentLength = Number(request.headers.get("content-length"))

  if (
    !contentType?.toLowerCase().startsWith("multipart/form-data;") ||
    (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_SIZE_BYTES)
  ) {
    return undefined
  }

  try {
    const formData = await request.formData()
    const avatar = formData.get("avatar")

    return avatar instanceof File &&
      avatar.size > 0 &&
      avatar.size <= MAX_AVATAR_SIZE_BYTES &&
      ACCEPTED_AVATAR_TYPES.has(avatar.type)
      ? avatar
      : undefined
  } catch {
    return undefined
  }
}
