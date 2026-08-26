import { z } from "zod"

import { isBrazilianPhone, isBrazilianPostalCode } from "@/lib/brazilian-input"

const OptionalUrlSchema = z.union([z.literal(""), z.string().trim().url("Informe uma URL válida.")])
const OptionalDateSchema = z.union([z.literal(""), z.string().date("Informe uma data válida.")])
const OptionalBrazilianPhoneSchema = z.string().trim().refine(isBrazilianPhone, "Informe um número de telefone válido.")
const OptionalBrazilianPostalCodeSchema = z.string().trim().refine(isBrazilianPostalCode, "Informe um CEP brasileiro válido.")

const ProfileSchema = z.object({
  avatarUrl: OptionalUrlSchema,
  bio: z.string().trim().max(500, "A biografia deve ter no máximo 500 caracteres."),
  birthDate: OptionalDateSchema,
  city: z.string().trim().max(100),
  country: z.string().trim().max(2),
  email: z.string().trim().email("Informe um e-mail válido."),
  locale: z.string().trim().max(10),
  name: z.string().trim().min(2, "Informe seu nome completo.").max(100),
  phone: OptionalBrazilianPhoneSchema,
  state: z.string().trim().max(50),
  street: z.string().trim().max(255),
  timezone: z.string().trim().max(50),
  zipCode: OptionalBrazilianPostalCodeSchema,
})

type ProfileValues = z.infer<typeof ProfileSchema>

export { ProfileSchema }
export type { ProfileValues }
