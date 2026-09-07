import { z } from "zod"

import { isBrazilianPhone, isBrazilianPostalCode } from "@/lib/brazilian-input"
import { appLocales, isValidTimeZone } from "@/i18n/config"

type ProfileValidationMessages = {
  bioMax: string
  fullName: string
  invalidDate: string
  invalidEmail: string
  invalidPhone: string
  invalidPostalCode: string
  invalidTimeZone: string
  invalidUrl: string
}

function createProfileSchema(messages: ProfileValidationMessages) {
  return z.object({
    avatarUrl: z.union([z.literal(""), z.string().trim().url(messages.invalidUrl)]),
    bio: z.string().trim().max(500, messages.bioMax),
    birthDate: z.union([z.literal(""), z.string().date(messages.invalidDate)]),
    city: z.string().trim().max(100),
    country: z.string().trim().max(2),
    email: z.string().trim().email(messages.invalidEmail),
    locale: z.enum(appLocales),
    name: z.string().trim().min(2, messages.fullName).max(100),
    phone: z.string().trim().refine(isBrazilianPhone, messages.invalidPhone),
    state: z.string().trim().max(50),
    street: z.string().trim().max(255),
    timezone: z.string().trim().max(50).refine(
      (value) => value.length === 0 || isValidTimeZone(value),
      messages.invalidTimeZone,
    ),
    zipCode: z.string().trim().refine(isBrazilianPostalCode, messages.invalidPostalCode),
  })
}

type ProfileValues = z.infer<ReturnType<typeof createProfileSchema>>

export { createProfileSchema }
export type { ProfileValues }
