"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PosSystem } from "@/components/pos-system-api"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function PosPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PosSystem />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
