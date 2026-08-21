import { EmptyState, FadingDataTableIllustration } from "@/components/ui/empty-state"

import { DashboardHeaderActions } from "./dashboard-header-actions"

/**
 * Referência de composição para páginas autenticadas: a rota fornece o
 * conteúdo de palco e a feature ocupa o slot de ações do Header quando útil.
 */
function DashboardPage() {
  return (
    <>
      <DashboardHeaderActions />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 sm:px-8 sm:py-10">
        <header className="max-w-2xl space-y-2">
          <p className="text-overline text-capta-text-secondary">Visão geral</p>
          <h1 className="text-heading-3 text-capta-text-primary">Dashboard</h1>
          <p className="text-ui text-capta-text-secondary">
            Acompanhe as oportunidades e os sinais mais relevantes para o seu município.
          </p>
        </header>

        <div className="mt-8 flex min-h-72 flex-1 items-center justify-center py-12 sm:py-16">
          <EmptyState
            description="Quando as fontes e oportunidades estiverem conectadas, este espaço reunirá os indicadores do seu acompanhamento."
            illustration={<FadingDataTableIllustration className="h-32 w-64" />}
            title="Os dados do seu painel aparecerão aqui"
          />
        </div>
      </div>
    </>
  )
}

export { DashboardPage }
