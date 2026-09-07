"use client"

import { useCallback, useState } from "react"

import type { TwoFactorAuthenticationStatus } from "./two-factor-authentication.types"

/**
 * Centraliza os estados transitÃ³rios do fluxo TOTP.
 *
 * A consulta do estado persistido e as mutaÃ§Ãµes serÃ£o adicionadas aqui quando
 * o contrato da Authentication API estiver disponÃ­vel, sem expor detalhes ao painel.
 */
function useTwoFactorAuthentication() {
  const [status, setStatus] = useState<TwoFactorAuthenticationStatus>("disabled")

  const beginConfiguration = useCallback(() => setStatus("configuring"), [])
  const beginSetup = useCallback(() => setStatus("setting-up"), [])
  const beginVerification = useCallback(() => setStatus("verifying"), [])
  const cancelSetup = useCallback(() => setStatus("disabled"), [])
  const markEnabled = useCallback(() => setStatus("enabled"), [])
  const markDisabled = useCallback(() => setStatus("disabled"), [])

  return {
    beginConfiguration,
    beginSetup,
    beginVerification,
    cancelSetup,
    markDisabled,
    markEnabled,
    status,
  }
}

export { useTwoFactorAuthentication }
