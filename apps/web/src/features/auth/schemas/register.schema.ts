import { z } from "zod"

import { PasswordSchema } from "./password.schema"

const RegisterSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  name: z.string().trim().min(2, "Informe seu nome completo.").max(100),
  password: PasswordSchema,
})

type RegisterValues = z.infer<typeof RegisterSchema>

export { RegisterSchema }
export type { RegisterValues }
