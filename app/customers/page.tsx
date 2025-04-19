import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomersList } from "@/components/customers-list"

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <CustomersList />
    </DashboardLayout>
  )
}
