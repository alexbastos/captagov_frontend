# @capta/api-client

Tipos TypeScript gerados a partir do snapshot versionado da Authentication API.

## Geração

```bash
pnpm generate:api-types
```

O comando lê exclusivamente `docs/openapi/authentication-api.openapi.json` e atualiza `src/generated/authentication-api.ts`. Não edite o arquivo gerado manualmente.

## Transporte HTTP

`ApiHttpClient` é um transporte sem estado, destinado apenas a chamadas servidor-servidor. A URL base e o token Bearer, quando necessário, são sempre injetados pelo chamador; o pacote não lê cookies, não persiste tokens e não depende de React ou Next.js.

## Erros de autenticação

`normalizeAuthenticationError` preserva a categoria HTTP segura da resposta malsucedida (`400`, `401`, `403`, `409`, `429` ou `5xx`) para que o BFF possa traduzi-la conforme a ação. Essa tradução é responsabilidade do BFF: ela usa códigos públicos sem expor mensagens remotas, detalhes técnicos ou informações que permitam enumeração de contas.

`getApiErrorLogContext` retorna apenas metadados mínimos para logs do BFF (status, código, categoria e request ID da API). Ele descarta a mensagem remota e o corpo da requisição. Esse contexto é exclusivo do servidor e nunca deve ser serializado para o navegador.

## Endpoints de autenticação

`AuthenticationApiClient` concentra os sete endpoints desta fase: cadastro, login, verificação e reenvio de e-mail, renovação, logout e perfil atual. Ele recebe uma instância de `ApiHttpClient`; tokens Bearer são sempre argumentos explícitos dos métodos autenticados e nunca são lidos, armazenados ou retornados por estado interno.

As respostas, inclusive as malsucedidas, permanecem disponíveis ao BFF para que ele registre o contexto interno com `getApiErrorLogContext` e devolva ao navegador somente a tradução pública apropriada ao fluxo.
