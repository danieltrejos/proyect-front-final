"use client"

import { useEffect, useState } from "react"
import { Calendar, ClipboardList, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface Sale {
  id: number
  total: number
  paymentAmount: number
  change: number
  paymentMethod: string
  createdAt: string
  updatedAt: string
  userId: number
  customerId: number
  items: {
    id: number
    quantity: number
    price: number
    saleId: number
    productId: number
    product: {
      id: number
      name: string
      description: string
      type: string
      price: number
      image: string | null
      stock: number
      createdAt: string
      updatedAt: string
    }
  }[]
  user: {
    id: number
    name: string
    email: string
    role: string
    createdAt: string
    updatedAt: string
  }
  customer: {
    id: number
    name: string
    email: string
    phone: string
    createdAt: string
    updatedAt: string
  }
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
}

export function CustomerOrders() {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [customerFilter, setCustomerFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [customers, setCustomers] = useState<Customer[]>([])
  useEffect(() => {
    // Fetch ventas y clientes desde el backend
    const fetchData = async () => {
      try {
        setIsLoading(true)
        console.log("🔄 Fetching sales and customers from backend...")

        // Fetch en paralelo para ventas y clientes
        const [salesResponse, customersResponse] = await Promise.all([
          fetch('http://localhost:8000/api/v1/sales'),
          fetch('http://localhost:8000/api/v1/customers')
        ])

        if (!salesResponse.ok) {
          throw new Error(`Sales API error! status: ${salesResponse.status}`)
        }
        if (!customersResponse.ok) {
          throw new Error(`Customers API error! status: ${customersResponse.status}`)
        }

        const salesData = await salesResponse.json()
        const customersData = await customersResponse.json()

        console.log("Sales data received:", salesData)
        console.log("Customers data received:", customersData)

        setSales(salesData)
        setCustomers(customersData)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Fallo al cargar los perdidos y clientes desde el servidor",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [])

  const filteredSales = sales.filter((sale) => {
    // Filter by search term
    const searchMatch =
      sale.id.toString().includes(searchTerm) ||
      (sale.customer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      sale.items?.some((item) => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())) || false

    // Filter by date
    const dateMatch = dateFilter ? new Date(sale.createdAt).toDateString() === dateFilter.toDateString() : true

    // Filter by customer
    const customerMatch = customerFilter === "all" || sale.customer?.id?.toString() === customerFilter

    // For now, we'll consider all sales as "completed" since the backend doesn't have status
    // Filter by status - we can add this logic later if needed
    const statusMatch = statusFilter === "all" || statusFilter === "completed"

    return searchMatch && dateMatch && customerMatch && statusMatch
  })

  // Group sales by customer
  const salesByCustomer = filteredSales.reduce<Record<string, Sale[]>>((acc, sale) => {
    const customerId = sale.customer?.id?.toString() || 'unknown'
    if (!acc[customerId]) {
      acc[customerId] = []
    }
    acc[customerId].push(sale)
    return acc
  }, {})
  const getStatusBadge = (status: string = "completed") => {
    // Since backend sales don't have status, we'll default to completed
    return <Badge className="bg-green-500">Completado</Badge>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Módulo de pedido de clientes</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos por cliente</CardTitle>
          <CardDescription>Ver y filtrar pedidos agrupados por clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID, cliente o producto..."
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
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name || `Cliente ${customer.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="in-progress">En progreso</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {(dateFilter || customerFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDateFilter(undefined)
                    setCustomerFilter("all")
                    setStatusFilter("all")
                  }}
                  className="px-3"
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>) : Object.keys(salesByCustomer).length === 0 ? (
              <div className="text-center py-10">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No se encontraron pedidos</h3>
                <p className="text-muted-foreground">Prueba ajustando los filtros</p>
              </div>
            ) : (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(salesByCustomer).map(([customerId, customerSales]) => {
                const customer = customers.find((c) => c.id.toString() === customerId)
                if (!customer) return null

                return (
                  <AccordionItem key={customerId} value={customerId}>
                    <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground px-4 rounded-md">                      <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span>{customer.name || `Cliente ${customerId}`}</span>
                      <Badge variant="outline" className="ml-2">
                        {customerSales.length} pedidos
                      </Badge>
                    </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-md border mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID Pedido</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Articulos</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Metodo de pago</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Atendido por</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerSales.map((sale) => (
                              <TableRow key={sale.id}>
                                <TableCell className="font-medium">#{sale.id}</TableCell>
                                <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>                                <TableCell>
                                  <ul className="list-disc list-inside">
                                    {sale.items?.map((item, index) => (
                                      <li key={index}>
                                        {item.quantity}x {item.product?.name || 'Producto'}
                                      </li>
                                    )) || <li>Sin items</li>}
                                  </ul>
                                </TableCell>
                                <TableCell>${sale.total.toLocaleString()}</TableCell>
                                <TableCell>{sale.paymentMethod}</TableCell>
                                <TableCell>{getStatusBadge()}</TableCell>
                                <TableCell>{sale.user?.name || 'Usuario no especificado'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
