"use client"

import { useEffect, useState } from "react"
import { Calendar, Download, Search, User, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Date range filter states
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Amount range filter states
  const [minAmount, setMinAmount] = useState<string>("")
  const [maxAmount, setMaxAmount] = useState<string>("")

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
        } console.log("🎉 Sales history data loaded successfully")
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
      (sale.customer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      sale.items?.some((item) => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())) || false

    // Filter by single date (legacy support)
    const dateMatch = dateFilter ? new Date(sale.createdAt).toDateString() === dateFilter.toDateString() : true

    // Filter by date range
    const saleDate = new Date(sale.createdAt)
    const startDateMatch = startDate ? saleDate >= startDate : true
    const endDateMatch = endDate ? saleDate <= endDate : true
    const dateRangeMatch = startDateMatch && endDateMatch

    // Filter by amount range
    const amountMatch =
      (minAmount === "" || sale.total >= parseFloat(minAmount)) &&
      (maxAmount === "" || sale.total <= parseFloat(maxAmount))

    // Filter by customer
    const customerMatch = customerFilter === "all" || sale.customer.id.toString() === customerFilter

    // Filter by user
    const userMatch = userFilter === "all" || sale.user.id.toString() === userFilter

    return searchMatch && dateMatch && dateRangeMatch && amountMatch && customerMatch && userMatch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSales = filteredSales.slice(startIndex, endIndex)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, dateFilter, startDate, endDate, minAmount, maxAmount, customerFilter, userFilter])

  const clearAllFilters = () => {
    setSearchTerm("")
    setDateFilter(undefined)
    setStartDate(undefined)
    setEndDate(undefined)
    setMinAmount("")
    setMaxAmount("")
    setCustomerFilter("all")
    setUserFilter("all")
    setCurrentPage(1)
  }

  const exportToCSV = () => {    // Create CSV content - export ALL filtered sales, not just current page
    const headers = ["ID", "Date", "Customer", "User", "Items", "Total", "Payment Method"]
    const rows = filteredSales.map((sale) => [
      sale.id,
      new Date(sale.createdAt).toLocaleString(),
      sale.customer?.name || 'Cliente no especificado',
      sale.user?.name || 'Usuario no especificado',
      sale.items?.map((item) => `${item.quantity}x ${item.product?.name || 'Producto'}`).join(", ") || 'Sin items',
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
        <CardContent>          {/* Search Bar */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID, Cliente, o producto..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>

            {/* Filters Row 1: Date filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Fecha específica"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Fecha desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Fecha hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Monto mín."
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Monto máx."
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Filters Row 2: Customer and User filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por cliente" />
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name || `Cliente ${customer.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name || `Usuario ${user.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results summary */}
            <div className="text-sm text-muted-foreground">
              Mostrando {paginatedSales.length} de {filteredSales.length} ventas
              {filteredSales.length !== sales.length && ` (filtrado de ${sales.length} total)`}
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
                </TableHeader>                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No se encontró registro de ventas
                      </TableCell>
                    </TableRow>
                  ) : (paginatedSales.map((sale) => (<TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {sale.customer?.name || 'Cliente no especificado'}
                      </div>
                    </TableCell>
                    <TableCell>{sale.user?.name || 'Usuario no especificado'}</TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside">
                        {sale.items?.map((item, index) => (
                          <li key={index}>
                            {item.quantity}x {item.product?.name || 'Producto'}
                          </li>
                        )) || 'Sin items'}
                      </ul>
                    </TableCell>
                    <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                    <TableCell>{sale.paymentMethod}</TableCell>
                  </TableRow>
                  ))
                  )}
                </TableBody>              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredSales.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {/* Add ellipsis if there's a gap */}
                        {index > 0 && array[index - 1] < page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
