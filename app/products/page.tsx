"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProductsList } from "@/components/products-list"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProductsList />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
