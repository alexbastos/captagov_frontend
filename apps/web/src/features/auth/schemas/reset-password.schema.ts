import { z } from "zod"

import { PasswordSchema } from "./password.schema"

const ResetPasswordSchema = z.object({
  confirmPassword: z.string(),
  password: PasswordSchema,
}).refine(({ confirmPassword, password }) => password === confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>

export { ResetPasswordSchema }
export type { ResetPasswordValues }
