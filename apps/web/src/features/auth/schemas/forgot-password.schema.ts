import { z } from "zod"

const ForgotPasswordSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
})

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>

export { ForgotPasswordSchema }
export type { ForgotPasswordValues }
