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

type SettingsBffError = {
  code: string
  message: string
  retryable: boolean
}

type SettingsBffResult<Data> =
  | { data: Data; ok: true; status: number }
  | { error: SettingsBffError; ok: false; status: number }

export type { AccountProfile, SettingsBffError, SettingsBffResult, SettingsUser }
