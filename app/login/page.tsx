"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/overview");
    }
  }, [isAuthenticated, loading, router]);
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  } return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Contenido principal */}
      <div className="w-full">
        <LoginForm />
      </div>
    </div>
  );
}
