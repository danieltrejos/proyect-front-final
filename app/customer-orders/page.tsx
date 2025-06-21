"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomerOrders } from "@/components/customer-orders"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function CustomerOrdersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CustomerOrders />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
