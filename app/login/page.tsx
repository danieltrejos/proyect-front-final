import { DashboardLayout } from "@/components/dashboard-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (

    <DashboardLayout>
      <div className="flex items-center justify-center h-screen">
        <LoginForm />
      </div>
    </DashboardLayout>
  )

}
