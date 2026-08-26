import type { Metadata } from "next"

import { SettingsPage } from "@/features/settings"

export const metadata: Metadata = {
  title: "Configurações",
}

export default function SettingsRoute() {
  return <SettingsPage />
}
