"use client"

import { useEffect, useState } from "react"
import { Calendar, Download, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Backend response interfaces
interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
  categoryId?: number
  createdAt?: string
  updatedAt?: string
}

interface SaleItem {
  id: number
  quantity: number
  price: number
  saleId: number
  productId: number
  product: Product
}

interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  createdAt?: string
  updatedAt?: string
}

interface User {
  id: number
  name: string
  email: string
  createdAt?: string
  updatedAt?: string
}

interface Sale {
  id: number
  customerId: number
  userId: number
  total: number
  paymentAmount: number
  change: number
  paymentMethod: string
  createdAt: string
  updatedAt: string
  customer: Customer
  user: User
  items: SaleItem[]
}

export function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [customerFilter, setCustomerFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchSalesHistory = async () => {
      try {
        setIsLoading(true)
        console.log("🔄 Cargando datos del historial de ventas...")

        // Obtener ventas desde el backend
        console.log("📊 Fetching sales from:", "http://localhost:8000/api/v1/sales")
        const salesResponse = await fetch("http://localhost:8000/api/v1/sales")

        if (!salesResponse.ok) {
          throw new Error(`HTTP error al obtener ventas: ${salesResponse.status}`)
        } const salesData = await salesResponse.json()
        console.log("✅ Sales data received:", salesData)
        setSales(salesData)

        // Obtener clientes para el filtro
        console.log("👥 Fetching customers from:", "http://localhost:8000/api/v1/customers")
        const customersResponse = await fetch("http://localhost:8000/api/v1/customers")

        if (customersResponse.ok) {
          const customersData = await customersResponse.json()
          console.log("✅ Customers data received:", customersData)
          setCustomers(customersData)
        } else {
          console.warn("⚠️ Could not fetch customers:", customersResponse.status)
        }

        // Obtener usuarios para el filtro
        console.log("🔐 Fetching users from:", "http://localhost:8000/api/v1/users")
        const usersResponse = await fetch("http://localhost:8000/api/v1/users")

        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          console.log("✅ Users data received:", usersData)
          setUsers(usersData)
        } else {
          console.warn("⚠️ Could not fetch users:", usersResponse.status)
        }

        console.log("🎉 Sales history data loaded successfully")
      } catch (error) {
        console.error("❌ Error loading sales history:", error)
        // Fallback to empty array on error
        setSales([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesHistory()
  }, [])

  const filteredSales = sales.filter((sale) => {
    // Filter by search term
    const searchMatch =
      sale.id.toString().includes(searchTerm) ||
      sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some((item) => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by date
    const dateMatch = dateFilter ? new Date(sale.createdAt).toDateString() === dateFilter.toDateString() : true

    // Filter by customer
    const customerMatch = customerFilter === "all" || sale.customer.id.toString() === customerFilter

    // Filter by user
    const userMatch = userFilter === "all" || sale.user.id.toString() === userFilter

    return searchMatch && dateMatch && customerMatch && userMatch
  })
  const exportToCSV = () => {
    // Create CSV content
    const headers = ["ID", "Date", "Customer", "User", "Items", "Total", "Payment Method"]
    const rows = filteredSales.map((sale) => [
      sale.id,
      new Date(sale.createdAt).toLocaleString(),
      sale.customer.name,
      sale.user.name,
      sale.items.map((item) => `${item.quantity}x ${item.product.name}`).join(", "),
      `$${sale.total.toFixed(2)}`,
      sale.paymentMethod,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `sales_history_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Historial de ventas</h1>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar a CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de ventas</CardTitle>
          <CardDescription>Ver y filtrar el historial de ventas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID, Cliente, o producto..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Filtrar por fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                </PopoverContent>
              </Popover>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dateFilter && (
                <Button variant="ghost" onClick={() => setDateFilter(undefined)} className="px-3">
                  Limpiar filtro
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha y hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Articulos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Forma de pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No se encontró registro de ventas
                      </TableCell>
                    </TableRow>
                  ) : (filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {sale.customer.name}
                        </div>
                      </TableCell>
                      <TableCell>{sale.user.name}</TableCell>                        <TableCell>
                        <ul className="list-disc list-inside">
                          {sale.items.map((item, index) => (
                            <li key={index}>
                              {item.quantity}x {item.product.name}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                      <TableCell>{sale.paymentMethod}</TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
