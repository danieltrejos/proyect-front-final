import { DashboardLayout } from "@/components/dashboard-layout"
import { PosSystem } from "@/components/pos-system-api"

export default function PosPage() {
  return (
    <DashboardLayout>
      <PosSystem />
    </DashboardLayout>
  )
}
