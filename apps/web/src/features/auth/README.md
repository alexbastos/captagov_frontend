# Feature de autenticação

Esta feature contém exclusivamente os contratos e a interface de autenticação do navegador.

Os fluxos públicos usam o `AuthPageShell` no layout compartilhado de autenticação. Cada rota renderiza apenas seu formulário, enquanto o hook correspondente coordena validação, mutation e notificações.

- `components/shell/`: moldura compartilhada, contexto de entrada e artwork do fluxo de recuperação.
- `components/forms/`: interfaces dos fluxos de login, cadastro, recuperação e redefinição de senha, além do botão social reutilizável.
- `components/navigation/`: navegação interna dos fluxos públicos de autenticação.
- `components/status/`: estados transitórios e finais dos fluxos, como a criação de conta e a confirmação de envio de e-mail.
- `components/showcase/`: elementos visuais do painel de oportunidades, isolados dos formulários.
- `hooks/`: coordenação de formulários, mutations e leitura de sessão. `useLogin` coordena apenas o login.
- `lib/`: utilitários puros da feature, como validação do retorno pós-login.
- `schemas/`: validação Zod próxima a cada formulário.
- `services/`: único ponto client-side para chamadas relativas a `/api/auth/*`.
- `types/`: contratos públicos e sanitizados. Tokens não pertencem a esta área.

O BFF, cookies e tokens permanecem em `src/lib/server/` e nunca podem ser importados por esta feature.
