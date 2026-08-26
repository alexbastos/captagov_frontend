import { z } from "zod"

import { isBrazilianPostalCode } from "@/lib/brazilian-input"
import { createUnauthenticatedResponse, parseJsonBody } from "@/lib/server/auth-bff-route"
import {
  applySettingsSessionCookies,
  createSettingsResponse,
  getAuthenticatedSettingsContext,
} from "@/lib/server/settings-bff-route"
import { lookupBrazilianPostalCode } from "@/lib/server/viacep"
import type { NextRequest } from "next/server"

const PostalCodeRequestSchema = z.object({
  postalCode: z.string().refine(isBrazilianPostalCode),
}).strict()

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const context = await getAuthenticatedSettingsContext(request)

    if (!context.session) {
      return applySettingsSessionCookies(context, createUnauthenticatedResponse())
    }

    const input = await parseJsonBody(request, PostalCodeRequestSchema)

    if (!input) {
      return createSettingsResponse(context, {
        error: {
          code: "INVALID_POSTAL_CODE",
          message: "Informe um CEP válido.",
          retryable: false,
        },
      }, 400)
    }

    const result = await lookupBrazilianPostalCode(input.postalCode)

    if (result.kind === "not-found") {
      return createSettingsResponse(context, {
        error: {
          code: "POSTAL_CODE_NOT_FOUND",
          message: "CEP não encontrado. Confira os números ou preencha o endereço manualmente.",
          retryable: false,
        },
      }, 404)
    }

    if (result.kind === "unavailable") {
      return createSettingsResponse(context, {
        error: {
          code: "POSTAL_CODE_UNAVAILABLE",
          message: "Não foi possível consultar o CEP agora. Preencha o endereço manualmente.",
          retryable: true,
        },
      }, 503)
    }

    return createSettingsResponse(context, { address: result.address })
  } catch {
    return Response.json(
      {
        error: {
          code: "POSTAL_CODE_REQUEST_FAILED",
          message: "Não foi possível consultar o CEP agora. Preencha o endereço manualmente.",
          retryable: true,
        },
      },
      {
        headers: {
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        },
        status: 503,
      }
    )
  }
}
