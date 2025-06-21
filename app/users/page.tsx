"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { UsersList } from "@/components/users-list"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UsersList />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
