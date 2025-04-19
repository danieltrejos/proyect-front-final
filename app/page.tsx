import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ProductsList } from "@/components/products-list"

export default function Home() {
  return (
    <DashboardLayout>
      {/* <DashboardOverview /> */}
      <ProductsList />
    </DashboardLayout>
  )
}
