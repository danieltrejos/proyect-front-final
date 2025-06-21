"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { InvoicesManagement } from "@/components/invoices-management"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function InvoicesPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <InvoicesManagement />
            </DashboardLayout>
        </ProtectedRoute>
    )
}
