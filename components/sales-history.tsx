"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Download,
  Search,
  UserIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Receipt,
  DollarSign,
  Clock,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/lib/api-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

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
  user: any // Renamed User to avoid redeclaration
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
  const [users, setUsers] = useState<any[]>([]) // Renamed User to avoid redeclaration
  const [showFilters, setShowFilters] = useState(false)

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
        console.log("📊 Fetching sales from:", API_ENDPOINTS.sales)
        const salesResponse = await fetch(API_ENDPOINTS.sales)

        if (!salesResponse.ok) {
          throw new Error(`HTTP error al obtener ventas: ${salesResponse.status}`)
        }

        const salesData = await salesResponse.json()
        console.log("✅ Sales data received:", salesData)
        setSales(salesData)

        // Obtener clientes para el filtro
        console.log("👥 Fetching customers from:", API_ENDPOINTS.customers)
        const customersResponse = await fetch(API_ENDPOINTS.customers)

        if (customersResponse.ok) {
          const customersData = await customersResponse.json()
          console.log("✅ Customers data received:", customersData)
          setCustomers(customersData)
        } else {
          console.warn("⚠️ Could not fetch customers:", customersResponse.status)
        }

        // Obtener usuarios para el filtro
        console.log("🔐 Fetching users from:", API_ENDPOINTS.users)
        const usersResponse = await fetch(API_ENDPOINTS.users)

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
      (sale.customer?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      sale.items?.some((item) => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      false

    // Filter by single date (legacy support)
    const dateMatch = dateFilter ? new Date(sale.createdAt).toDateString() === dateFilter.toDateString() : true

    // Filter by date range
    const saleDate = new Date(sale.createdAt)
    const startDateMatch = startDate ? saleDate >= startDate : true
    const endDateMatch = endDate ? saleDate <= endDate : true
    const dateRangeMatch = startDateMatch && endDateMatch

    // Filter by amount range
    const amountMatch =
      (minAmount === "" || sale.total >= Number.parseFloat(minAmount)) &&
      (maxAmount === "" || sale.total <= Number.parseFloat(maxAmount))

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

  const exportToCSV = () => {
    // Create CSV content - export ALL filtered sales, not just current page
    const headers = ["ID", "Date", "Customer", "User", "Items", "Total", "Payment Method"]
    const rows = filteredSales.map((sale) => [
      sale.id,
      new Date(sale.createdAt).toLocaleString(),
      sale.customer?.name || "Cliente no especificado",
      sale.user?.name || "Usuario no especificado",
      sale.items?.map((item) => `${item.quantity}x ${item.product?.name || "Producto"}`).join(", ") || "Sin items",
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

  // Calcular estadísticas
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header - Mejorado para móviles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Historial de ventas</h1>
          {/* Estadísticas rápidas en móvil */}
          <div className="flex gap-2 mt-2 sm:hidden">
            <Badge variant="outline" className="text-xs">
              <Receipt className="w-3 h-3 mr-1" />
              {filteredSales.length} ventas
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />${totalSales.toFixed(2)}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {/* Estadísticas en desktop */}
          <div className="hidden sm:flex gap-2">
            <Badge variant="outline">
              <Receipt className="w-3 h-3 mr-1" />
              {filteredSales.length} ventas
            </Badge>
            <Badge variant="secondary">
              <DollarSign className="w-3 h-3 mr-1" />${totalSales.toFixed(2)}
            </Badge>
            {averageSale > 0 && <Badge variant="outline">Promedio: ${averageSale.toFixed(2)}</Badge>}
          </div>
          <Button onClick={exportToCSV} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar a CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registro de ventas
          </CardTitle>
          <CardDescription>Ver y filtrar el historial de ventas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda y botón de filtros */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex-1 sm:flex-none">
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </Button>
              <Button variant="outline" onClick={clearAllFilters} className="flex-1 sm:flex-none">
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>

          {/* Panel de filtros colapsible */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Filtros avanzados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filtros de fecha */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Filtros de fecha</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span className="truncate">
                              {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Fecha específica"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateFilter}
                            onSelect={setDateFilter}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span className="truncate">
                              {startDate ? format(startDate, "dd/MM/yyyy") : "Fecha desde"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span className="truncate">{endDate ? format(endDate, "dd/MM/yyyy") : "Fecha hasta"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Filtros de monto */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Rango de montos</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        placeholder="Monto mínimo"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Monto máximo"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filtros de cliente y usuario */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Filtros por persona</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select value={customerFilter} onValueChange={setCustomerFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por cliente" />
                        </SelectTrigger>
                        <SelectContent>
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
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Resumen de resultados */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <div>
              Mostrando {paginatedSales.length} de {filteredSales.length} ventas
              {filteredSales.length !== sales.length && ` (filtrado de ${sales.length} total)`}
            </div>
            {averageSale > 0 && <div className="sm:hidden">Promedio: ${averageSale.toFixed(2)}</div>}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden lg:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha y hora</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Artículos</TableHead>
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
                    ) : (
                      paginatedSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.id}</TableCell>
                          <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              {sale.customer?.name || "Cliente no especificado"}
                            </div>
                          </TableCell>
                          <TableCell>{sale.user?.name || "Usuario no especificado"}</TableCell>
                          <TableCell>
                            <ul className="list-disc list-inside">
                              {sale.items?.map((item, index) => (
                                <li key={index}>
                                  {item.quantity}x {item.product?.name || "Producto"}
                                </li>
                              )) || "Sin items"}
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

              {/* Vista de tarjetas para móvil y tablet */}
              <div className="lg:hidden space-y-4">
                {filteredSales.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No se encontró registro de ventas</p>
                  </div>
                ) : (
                  paginatedSales.map((sale) => (
                    <Card key={sale.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{sale.id}</Badge>
                            <Badge variant="secondary">${sale.total.toFixed(2)}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {new Date(sale.createdAt).toLocaleDateString()}
                            <br />
                            {new Date(sale.createdAt).toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Cliente:</span>
                            <span>{sale.customer?.name || "No especificado"}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Usuario:</span>
                            <span>{sale.user?.name || "No especificado"}</span>
                          </div>

                          <div className="flex items-start gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <span className="font-medium">Artículos:</span>
                              <div className="mt-1">
                                {sale.items?.map((item, index) => (
                                  <div
                                    key={index}
                                    className="text-xs bg-muted px-2 py-1 rounded mb-1 inline-block mr-1"
                                  >
                                    {item.quantity}x {item.product?.name || "Producto"}
                                  </div>
                                )) || <span className="text-muted-foreground">Sin items</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-medium">Pago:</span>
                            <Badge variant="outline">{sale.paymentMethod}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}

          {/* Controles de paginación - Mejorados para móviles */}
          {filteredSales.length > 0 && totalPages > 1 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>

                {/* Números de página - Menos en móvil */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      const maxVisible = window.innerWidth < 640 ? 3 : 5
                      const halfVisible = Math.floor(maxVisible / 2)

                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= halfVisible
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] < page - 1 && (
                          <span className="px-2 text-muted-foreground text-xs">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[32px] h-8 p-0 text-xs"
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
                  <span className="hidden sm:inline">Siguiente</span>
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
