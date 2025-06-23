"use client"

import { useEffect, useState } from "react"
import { Beer, DollarSign, Package, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { fetchDashboardStats, DashboardStats } from "@/lib/stats-api"
import { useRouter } from "next/navigation"

export function DashboardOverview() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockCount: 0,
    monthlySales: 0,
    monthlyRevenue: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const dashboardStats = await fetchDashboardStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        setError("Error al cargar las estadísticas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Funciones de navegación
  const navigateToProducts = () => router.push('/products')
  const navigateToInventory = () => router.push('/inventory')
  const navigateToPOS = () => router.push('/pos')
  const navigateToSalesHistory = () => router.push('/sales-history')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Vista General del Dashboard</h1>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card Total de productos */}
        <Card
          className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 active:scale-95"
          onClick={navigateToProducts}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de productos</CardTitle>
            <Beer className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Cargando..." : stats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">Productos en el inventario</p>
          </CardContent>
        </Card>

        {/* Card Productos con bajo stock */}
        <Card
          className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 active:scale-95"
          onClick={navigateToInventory}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos con bajo stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
          </CardHeader>
          <CardContent>            <div className="text-2xl font-bold">
            {isLoading ? "Cargando..." : stats.lowStockCount}
          </div>
            <p className="text-xs text-muted-foreground">Stock menor a 100 unidades</p>
          </CardContent>
        </Card>

        {/* Card Ventas este mes */}
        <Card
          className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 active:scale-95"
          onClick={navigateToPOS}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas este mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Cargando..." : stats.monthlySales}
            </div>
            <p className="text-xs text-muted-foreground">Órdenes de este mes</p>
          </CardContent>
        </Card>

        {/* Card Ingresos este mes */}
        <Card
          className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 active:scale-95"
          onClick={navigateToSalesHistory}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos este mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Cargando..." : formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Ingresos del mes actual</p>
          </CardContent>
        </Card>      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Vista general de ventas</CardTitle>
            <CardDescription>
              Ingresos por mes de los últimos 12 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ventas recientes</CardTitle>
            <CardDescription>
              {isLoading ? "Cargando..." : `${stats.monthlySales} ventas este mes`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
