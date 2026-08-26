import type { SettingsBffError, SettingsBffResult } from "../types/settings"

type PostalCodeAddress = {
  city: string
  country: "BR"
  state: string
  street: string
}

const GENERIC_ERROR: SettingsBffError = {
  code: "POSTAL_CODE_REQUEST_FAILED",
  message: "Não foi possível consultar o CEP agora. Preencha o endereço manualmente.",
  retryable: true,
}

async function lookupPostalCode(postalCode: string, signal: AbortSignal): Promise<SettingsBffResult<{ address: PostalCodeAddress }>> {
  try {
    const response = await fetch("/api/settings/postal-code", {
      body: JSON.stringify({ postalCode }),
      cache: "no-store",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      method: "POST",
      signal,
    })
    const payload = await readJson(response)

    if (!response.ok) {
      return { error: getPublicError(payload), ok: false, status: response.status }
    }

    return { data: payload as { address: PostalCodeAddress }, ok: true, status: response.status }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error
    }

    return { error: GENERIC_ERROR, ok: false, status: 503 }
  }
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

export { lookupPostalCode }
