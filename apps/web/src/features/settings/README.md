# Feature de Configurações

Esta feature concentra a interface de configurações da conta em `/app/settings`.

## Primeira etapa

A casca visual estabelece o título, a navegação entre seções e a superfície
de conteúdo. Ela ainda não consulta nem altera dados: Perfil, Segurança e
Atividade serão implementados em etapas independentes.

As chamadas do navegador para a conta devem passar exclusivamente pelas rotas
em `/api/settings`; a feature nunca chama a Authentication API diretamente.
