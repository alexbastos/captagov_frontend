import { z } from "zod"

type PasswordValidationMessages = {
  lowercase: string
  min: string
  noSpaces: string
  number: string
  special: string
  uppercase: string
}

function createPasswordSchema(messages: PasswordValidationMessages) {
  return z.string()
    .min(8, messages.min)
    .regex(/[A-Z]/, messages.uppercase)
    .regex(/[a-z]/, messages.lowercase)
    .regex(/[0-9]/, messages.number)
    .regex(/[^A-Za-z0-9\s]/, messages.special)
    .regex(/^\S+$/, messages.noSpaces)
}

export { createPasswordSchema }
export type { PasswordValidationMessages }
