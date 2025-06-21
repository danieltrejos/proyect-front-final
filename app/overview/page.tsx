"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function OverviewPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <DashboardOverview />
            </DashboardLayout>
        </ProtectedRoute>
    )
}