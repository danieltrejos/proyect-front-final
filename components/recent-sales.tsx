"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetchRecentSales, RecentSale } from "@/lib/stats-api"

export function RecentSales() {
  const [sales, setSales] = useState<RecentSale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const recentSales = await fetchRecentSales()
        setSales(recentSales)
      } catch (error) {
        console.error("Failed to fetch recent sales:", error)
        setError("Error al cargar ventas recientes")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate initials from customer name
  const getInitials = (name: string | null): string => {
    if (!name) return "AN" // Anonymous
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("")
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
            <div className="ml-4 space-y-1 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">No hay ventas recientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {getInitials(sale.customerName)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {sale.customerName || "Cliente Anónimo"}
            </p>
            <p className="text-sm text-muted-foreground">
              {sale.itemCount} {sale.itemCount === 1 ? 'artículo' : 'artículos'} • {formatDate(sale.createdAt)}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {formatCurrency(sale.total)}
          </div>
        </div>
      ))}
    </div>
  )
}
