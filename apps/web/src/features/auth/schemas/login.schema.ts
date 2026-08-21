import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
})

type LoginValues = z.infer<typeof LoginSchema>

export { LoginSchema }
export type { LoginValues }
