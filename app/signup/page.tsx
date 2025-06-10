import { DashboardLayout } from "@/components/dashboard-layout"
import { SignupForm } from "@/components/auth/signup-form"



export default function SignupPage() {
  return (

    <DashboardLayout>
      <div className="flex items-center justify-center h-screen">
        <SignupForm />
      </div>
    </DashboardLayout>
  )
}
