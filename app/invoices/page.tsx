"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { InvoicesManagement } from "@/components/invoices-management"

export default function InvoicesPage() {
    return (
        <DashboardLayout>
            <InvoicesManagement />
        </DashboardLayout>
    )
}
