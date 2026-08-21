import "server-only"

import { z } from "zod"

const ServerEnvironmentSchema = z.object({
  AUTHENTICATION_API_BASE_URL: z
    .string()
    .url()
    .transform((value) => new URL(value))
    .refine((url) => url.protocol === "https:", "must use HTTPS")
    .refine((url) => url.username === "" && url.password === "", "must not include credentials")
    .refine((url) => url.search === "" && url.hash === "", "must not include query parameters or fragments")
    .transform((url) => url.origin),
  CAPTAGOV_APP_ORIGIN: z
    .string()
    .url()
    .transform((value) => new URL(value))
    .refine((url) => url.username === "" && url.password === "", "must not include credentials")
    .refine(
      (url) => url.pathname === "/" && url.search === "" && url.hash === "",
      "must be an origin without a path, query parameters, or fragments"
    )
    .transform((url) => url.origin),
})

type ServerEnvironment = {
  authenticationApiBaseUrl: string
  appOrigin: string
}

function getServerEnvironment(environment: NodeJS.ProcessEnv = process.env): ServerEnvironment {
  const result = ServerEnvironmentSchema.safeParse(environment)

  if (!result.success) {
    throw new Error("Invalid server configuration: required origins are missing or invalid")
  }

  if (environment.NODE_ENV === "production" && !result.data.CAPTAGOV_APP_ORIGIN.startsWith("https://")) {
    throw new Error("Invalid server configuration: CAPTAGOV_APP_ORIGIN must use HTTPS in production")
  }

  return {
    authenticationApiBaseUrl: result.data.AUTHENTICATION_API_BASE_URL,
    appOrigin: result.data.CAPTAGOV_APP_ORIGIN,
  }
}

export { getServerEnvironment }
export type { ServerEnvironment }
