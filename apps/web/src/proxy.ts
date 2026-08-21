import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth-constants"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Proxy é uma barreira de UX rápida, não uma autorização definitiva: ele só
 * verifica a presença do access cookie e jamais valida, renova ou interpreta
 * tokens. A rota protegida sempre deve confirmar a sessão no servidor.
 */
function proxy(request: NextRequest) {
  if (request.cookies.has(ACCESS_TOKEN_COOKIE_NAME)) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("from", `${request.nextUrl.pathname}${request.nextUrl.search}`)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/app/:path*"],
}

export { proxy }
