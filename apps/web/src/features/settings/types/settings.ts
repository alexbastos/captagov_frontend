import type { ActiveSessionsResponse } from "@capta/api-client"

type ProfileAddress = {
  city: string | null
  country: string | null
  state: string | null
  street: string | null
  zipCode: string | null
}

type AccountProfile = {
  avatarUrl: string | null
  bio: string | null
  birthDate: string | null
  locale: string | null
  phone: string | null
  timezone: string | null
  address: ProfileAddress
}

type SettingsUser = {
  email: string
  emailVerified: boolean
  id: string
  name: string
  profile: AccountProfile
  role: "ADMIN" | "USER"
}

type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}

type ActiveSession = ActiveSessionsResponse["sessions"][number]

type SettingsBffErrorCode =
  | "AUTHENTICATION_REQUEST_FAILED"
  | "INVALID_POSTAL_CODE"
  | "NETWORK_ERROR"
  | "POSTAL_CODE_NOT_FOUND"
  | "POSTAL_CODE_REQUEST_FAILED"
  | "POSTAL_CODE_UNAVAILABLE"
  | "RATE_LIMITED"
  | "REQUEST_NOT_ALLOWED"
  | "SERVICE_UNAVAILABLE"
  | "SESSION_UNAVAILABLE"
  | "SETTINGS_REQUEST_FAILED"
  | "VALIDATION_ERROR"

type SettingsBffError = {
  code: SettingsBffErrorCode
  retryable: boolean
}

type SettingsBffResult<Data> =
  | { data: Data; ok: true; status: number }
  | { error: SettingsBffError; ok: false; status: number }

export type { AccountProfile, ActiveSession, ChangePasswordInput, SettingsBffError, SettingsBffErrorCode, SettingsBffResult, SettingsUser }
