"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard-overview"

export default function OverviewPage() {
    return (
        <DashboardLayout>
            <DashboardOverview />
        </DashboardLayout>
    )
}