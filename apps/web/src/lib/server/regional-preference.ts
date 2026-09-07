import "server-only"

import type { AuthenticationApiClient } from "@capta/api-client"

import { isAppLocale } from "@/i18n/config"
import { setLocaleCookie, type LocaleCookieWriter } from "@/i18n/locale-cookie"
import { setTimeZoneCookie, type TimeZoneCookieWriter } from "@/i18n/time-zone-cookie"

type RegionalPreferenceCookieWriter = LocaleCookieWriter & TimeZoneCookieWriter

type RegionalPreferences = {
  locale: string | null | undefined
  timezone: string | null | undefined
}

type SynchronizeRegionalPreferenceCookiesInput = {
  accessToken: string
  client: AuthenticationApiClient
  cookieWriter: RegionalPreferenceCookieWriter
}

function setRegionalPreferenceCookies(
  cookieWriter: RegionalPreferenceCookieWriter,
  preferences: RegionalPreferences,
): void {
  if (preferences.locale && isAppLocale(preferences.locale)) {
    setLocaleCookie(cookieWriter, preferences.locale)
  }

  setTimeZoneCookie(cookieWriter, preferences.timezone)
}

/**
 * Busca as preferências somente nos fluxos que ainda não possuem o perfil.
 * Uma falha de projeção não pode invalidar uma autenticação bem-sucedida.
 */
async function synchronizeRegionalPreferenceCookies({
  accessToken,
  client,
  cookieWriter,
}: SynchronizeRegionalPreferenceCookiesInput): Promise<void> {
  try {
    const response = await client.getCurrentUser({ accessToken })
    const profile = response.status === 200 && response.data && "profile" in response.data
      ? response.data.profile
      : undefined

    if (profile) {
      setRegionalPreferenceCookies(cookieWriter, profile)
    }
  } catch {
    // A requisição continuará usando os padrões regionais seguros.
  }
}

export { setRegionalPreferenceCookies, synchronizeRegionalPreferenceCookies }
