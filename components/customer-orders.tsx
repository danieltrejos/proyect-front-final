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
import { toast } from "@/components/ui/use-toast"

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
    // Fetch sales and customers from the backend API
    const fetchData = async () => {
      try {
        setIsLoading(true)
        console.log("🔄 Fetching sales and customers from backend...")

        // Fetch sales and customers in parallel
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

        console.log("✅ Sales data received:", salesData)
        console.log("✅ Customers data received:", customersData)

        setSales(salesData)
        setCustomers(customersData)
        setIsLoading(false)      } catch (error) {
        console.error("❌ Failed to fetch data:", error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Failed to load orders and customers from server",
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
      sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some((item) => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by date
    const dateMatch = dateFilter ? new Date(sale.createdAt).toDateString() === dateFilter.toDateString() : true

    // Filter by customer
    const customerMatch = customerFilter === "all" || sale.customer.id.toString() === customerFilter

    // For now, we'll consider all sales as "completed" since the backend doesn't have status
    // Filter by status - we can add this logic later if needed
    const statusMatch = statusFilter === "all" || statusFilter === "completed"

    return searchMatch && dateMatch && customerMatch && statusMatch
  })

  // Group sales by customer
  const salesByCustomer = filteredSales.reduce<Record<string, Sale[]>>((acc, sale) => {
    const customerId = sale.customer.id.toString()
    if (!acc[customerId]) {
      acc[customerId] = []
    }
    acc[customerId].push(sale)
    return acc
  }, {})
  const getStatusBadge = (status: string = "completed") => {
    // Since backend sales don't have status, we'll default to completed
    return <Badge className="bg-green-500">Completed</Badge>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customer Orders</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders by Customer</CardTitle>
          <CardDescription>View and filter orders grouped by customer.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by ID, customer, or product..."
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
                    {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                </PopoverContent>
              </Popover>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>          ) : Object.keys(salesByCustomer).length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(salesByCustomer).map(([customerId, customerSales]) => {
                const customer = customers.find((c) => c.id.toString() === customerId)
                if (!customer) return null

                return (
                  <AccordionItem key={customerId} value={customerId}>
                    <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground px-4 rounded-md">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />                        <span>{customer.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {customerSales.length} orders
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-md border mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Payment Method</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Served By</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerSales.map((sale) => (
                              <TableRow key={sale.id}>
                                <TableCell className="font-medium">#{sale.id}</TableCell>
                                <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                  <ul className="list-disc list-inside">
                                    {sale.items.map((item, index) => (
                                      <li key={index}>
                                        {item.quantity}x {item.product.name}
                                      </li>
                                    ))}
                                  </ul>
                                </TableCell>
                                <TableCell>${sale.total.toLocaleString()}</TableCell>
                                <TableCell>{sale.paymentMethod}</TableCell>
                                <TableCell>{getStatusBadge()}</TableCell>
                                <TableCell>{sale.user.name}</TableCell>
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
