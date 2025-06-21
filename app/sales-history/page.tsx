"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { SalesHistory } from "@/components/sales-history"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SalesHistoryPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SalesHistory />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
