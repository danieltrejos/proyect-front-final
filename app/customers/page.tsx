"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomersList } from "@/components/customers-list"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function CustomersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CustomersList />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
