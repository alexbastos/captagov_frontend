This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Ambiente local

Copie `.env.example` para `.env.local` e informe a origem HTTPS da Authentication API em `AUTHENTICATION_API_BASE_URL`, além da origem pública do BFF em `CAPTAGOV_APP_ORIGIN`. Essas variáveis são exclusivas do servidor e não devem receber o prefixo `NEXT_PUBLIC_`.

## Sessão

Os tokens de sessão são mantidos somente em cookies `HttpOnly`, criados e removidos por Route Handlers do BFF. O access token expira em 15 minutos e o refresh token em 7 dias, de acordo com o contrato da Authentication API. Em produção os cookies usam `Secure`; em desenvolvimento local, o atributo é desabilitado para permitir HTTP em `localhost`.

As mutações do BFF validam obrigatoriamente o header `Origin` contra `CAPTAGOV_APP_ORIGIN`. Destinos de retorno pós-login ou pós-logout também aceitam somente paths internos seguros.

As rotas públicas `POST /api/auth/register`, `POST /api/auth/login` e `POST /api/auth/verify-email` não expõem tokens nem encaminham mensagens técnicas da API. O login grava os cookies de sessão somente na resposta do BFF.

As rotas autenticadas `POST /api/auth/resend-verification` e `POST /api/auth/logout` recebem o access token somente do cookie HttpOnly no servidor. O logout apaga os dois cookies locais mesmo quando a revogação remota não puder ser concluída.

O resolvedor server-only de sessão consulta `/users/me`. Se o access token receber `401`, ele rotaciona o refresh token uma única vez, substitui os dois cookies e repete a consulta. A rotação só é permitida quando o chamador fornece uma resposta mutável para persistir os novos cookies; isso evita invalidar um refresh token sem conseguir salvar seu substituto.

`POST /api/auth/session` é a leitura sanitizada para a interface. Ela retorna somente estado autenticado, um subconjunto do perfil e a expiração aproximada do access token; tokens nunca aparecem na resposta. Usa POST e valida `Origin` porque uma leitura com token expirado pode renovar cookies.

O [Proxy do Next.js 16](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) cobre apenas `/app` e subrotas. Ele redireciona rapidamente ao login quando o cookie de access token não está presente, preservando o destino interno em `from`; não valida nem renova tokens.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
