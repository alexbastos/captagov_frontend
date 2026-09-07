import type { ProfileValues } from "../schemas/profile.schema"
import type { ActiveSession, ChangePasswordInput, SettingsBffError, SettingsBffErrorCode, SettingsBffResult, SettingsUser } from "../types/settings"

const SETTINGS_ERROR_CODES = new Set<SettingsBffErrorCode>([
  "AUTHENTICATION_REQUEST_FAILED",
  "NETWORK_ERROR",
  "RATE_LIMITED",
  "REQUEST_NOT_ALLOWED",
  "SERVICE_UNAVAILABLE",
  "SESSION_UNAVAILABLE",
  "SETTINGS_REQUEST_FAILED",
  "VALIDATION_ERROR",
])

const GENERIC_ERROR: SettingsBffError = {
  code: "SETTINGS_REQUEST_FAILED",
  retryable: false,
}

const settingsBffClient = {
  changePassword: (input: ChangePasswordInput) => request<undefined>("/api/settings/password", "PUT", input),
  deleteAvatar: () => request<{ avatarUrl: null }>("/api/settings/avatar", "DELETE"),
  getActiveSessions: () => request<{ sessions: ActiveSession[] }>("/api/settings/sessions", "POST"),
  getProfile: () => request<{ user: SettingsUser }>("/api/settings/profile", "POST"),
  revokeActiveSession: (sessionId: string) => request<undefined>(`/api/settings/sessions/${encodeURIComponent(sessionId)}`, "DELETE"),
  updateProfile: (input: ProfileValues) => request<{ user: SettingsUser }>("/api/settings/profile", "PUT", toUpdateRequest(input)),
  uploadAvatar: (avatar: File) => {
    const body = new FormData()
    body.append("avatar", avatar)
    return request<{ avatarUrl: string }>("/api/settings/avatar", "POST", body)
  },
}

async function request<Data>(path: string, method: "DELETE" | "POST" | "PUT", body?: FormData | object): Promise<SettingsBffResult<Data>> {
  try {
    const isFormData = body instanceof FormData
    const response = await fetch(path, {
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      cache: "no-store",
      credentials: "same-origin",
      headers: body === undefined || isFormData ? undefined : { "content-type": "application/json" },
      method,
    })
    const payload = await readJson(response)

    if (!response.ok) {
      return { error: getPublicError(payload), ok: false, status: response.status }
    }

    return { data: payload as Data, ok: true, status: response.status }
  } catch {
    return {
      error: { code: "NETWORK_ERROR", retryable: true },
      ok: false,
      status: 503,
    }
  }
}

function toUpdateRequest(values: ProfileValues) {
  return {
    address: {
      city: toNullable(values.city),
      country: toNullable(values.country),
      state: toNullable(values.state),
      street: toNullable(values.street),
      zipCode: toNullable(values.zipCode),
    },
    bio: toNullable(values.bio),
    birthDate: toNullable(values.birthDate),
    locale: toNullable(values.locale),
    name: values.name,
    phone: toNullable(values.phone),
    timezone: toNullable(values.timezone),
  }
}

function toNullable(value: string): string | null {
  return value.trim() || null
}

async function readJson(response: Response): Promise<unknown> {
  if (!response.headers.get("content-type")?.includes("application/json")) {
    return undefined
  }

  try {
    return await response.json()
  } catch {
    return undefined
  }
}

function getPublicError(payload: unknown): SettingsBffError {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return GENERIC_ERROR
  }

  const { code, retryable } = payload.error
  return isSettingsErrorCode(code) && typeof retryable === "boolean"
    ? { code, retryable }
    : GENERIC_ERROR
}

function isSettingsErrorCode(value: unknown): value is SettingsBffErrorCode {
  return typeof value === "string" && SETTINGS_ERROR_CODES.has(value as SettingsBffErrorCode)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export { settingsBffClient }
