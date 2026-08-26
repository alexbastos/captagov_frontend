import type { ProfileValues } from "../schemas/profile.schema"
import type { SettingsBffError, SettingsBffResult, SettingsUser } from "../types/settings"

const GENERIC_ERROR: SettingsBffError = {
  code: "SETTINGS_REQUEST_FAILED",
  message: "Não foi possível concluir esta solicitação. Tente novamente.",
  retryable: false,
}

const settingsBffClient = {
  getProfile: () => request<{ user: SettingsUser }>("/api/settings/profile", "POST"),
  updateProfile: (input: ProfileValues) => request<{ user: SettingsUser }>("/api/settings/profile", "PUT", toUpdateRequest(input)),
}

async function request<Data>(path: string, method: "POST" | "PUT", body?: object): Promise<SettingsBffResult<Data>> {
  try {
    const response = await fetch(path, {
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      method,
    })
    const payload = await readJson(response)

    if (!response.ok) {
      return { error: getPublicError(payload), ok: false, status: response.status }
    }

    return { data: payload as Data, ok: true, status: response.status }
  } catch {
    return {
      error: { code: "NETWORK_ERROR", message: "Não foi possível conectar ao serviço. Tente novamente em instantes.", retryable: true },
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
    avatarUrl: toNullable(values.avatarUrl),
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

  const { code, message, retryable } = payload.error
  return typeof code === "string" && typeof message === "string" && typeof retryable === "boolean"
    ? { code, message, retryable }
    : GENERIC_ERROR
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export { settingsBffClient }
