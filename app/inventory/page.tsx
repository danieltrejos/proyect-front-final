"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryManagement } from "@/components/inventory-management"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <InventoryManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
