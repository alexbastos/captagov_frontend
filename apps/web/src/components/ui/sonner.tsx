"use client"

import { Toaster as SonnerToaster } from "sonner"

function Toaster() {
  return (
    <SonnerToaster
      containerAriaLabel="Notificações"
      duration={2800}
      gap={12}
      position="top-right"
      theme="light"
      toastOptions={{
        classNames: {
          content: "gap-1",
          description: "text-ui text-capta-text-secondary",
          icon: "mt-0.5 self-start text-capta-text-primary",
          title: "text-ui-semibold text-capta-text-primary",
          toast:
            "border-capta-border-default bg-capta-surface-card text-capta-text-primary shadow-[var(--card-base-shadow)]",
        },
      }}
    />
  )
}

export { Toaster }
