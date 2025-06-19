"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { fetchSalesByMonth, SalesByMonth } from "@/lib/stats-api"

interface ChartData {
  name: string;
  total: number;
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const salesData = await fetchSalesByMonth()
        
        // Transform the API data to chart format
        const chartData = salesData.map((item: SalesByMonth) => ({
          name: formatMonthName(item.month),
          total: item.revenue,
        }))
        
        setData(chartData)
      } catch (error) {
        console.error("Failed to fetch sales data:", error)
        setError("Error al cargar datos de ventas")
        // Fallback to empty data
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Convert YYYY-MM format to readable month name
  const formatMonthName = (monthString: string): string => {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
  }

  if (isLoading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando datos de ventas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <p className="text-muted-foreground">No hay datos de ventas disponibles</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            // Format as Colombian pesos, simplified
            return `$${(value / 1000).toFixed(0)}K`
          }}
        />
        <Bar 
          dataKey="total" 
          fill="#ef4444" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
