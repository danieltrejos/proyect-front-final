"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProductsList } from "@/components/products-list"
import SplashScreen from "@/components/splash-screen" // Ruta del splash-screen
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)

  // Oculta el splash screen después de que se complete su animación
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 4000) // Duración del splash-screen (5s + 1s de animación de salida)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ProtectedRoute>
      {showSplash ? (
        <SplashScreen
          duration={5000}
          logoSrc="/logo_oficial.png"
          redirectPath="/products"
        />) : (
        <DashboardLayout>
          <ProductsList />
        </DashboardLayout>
      )}
    </ProtectedRoute>
  )
}