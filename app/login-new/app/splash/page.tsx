"use client";

import { useSearchParams } from "next/navigation";
import SplashScreen from "@/components/splash-screen";

export default function SplashPage() {
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "true";

  return (
    <SplashScreen
      duration={3000}
      logoSrc="/logo_oficial.png"
      redirectPath="/dashboard"
      welcomeMessage={showWelcome}
    />
  );
}
