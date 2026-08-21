import { z } from "zod"

const VerifyEmailSchema = z.object({
  token: z.string().trim().min(1, "O link de verificação é inválido.").max(4096),
})

type VerifyEmailValues = z.infer<typeof VerifyEmailSchema>

export { VerifyEmailSchema }
export type { VerifyEmailValues }
