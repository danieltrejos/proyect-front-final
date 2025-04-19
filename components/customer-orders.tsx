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

interface Order {
  id: number
  date: string
  customer: {
    id: number
    name: string
  }
  user: {
    id: number
    name: string
  }
  items: {
    product: {
      id: number
      name: string
      price: number
    }
    quantity: number
  }[]
  total: number
  status: "completed" | "in-progress" | "cancelled"
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
}

export function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [customerFilter, setCustomerFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    // Fetch orders and customers from your API
    const fetchData = async () => {
      try {
        // In a real app, you would fetch from your API
        // const ordersResponse = await fetch('http://localhost:8000/api/v1/orders')
        // const customersResponse = await fetch('http://localhost:8000/api/v1/customers')
        // const ordersData = await ordersResponse.json()
        // const customersData = await customersResponse.json()

        // For demo purposes, using mock data
        setTimeout(() => {
          const mockCustomers: Customer[] = [
            {
              id: 1,
              name: "John Doe",
              email: "john.doe@example.com",
              phone: "555-123-4567",
            },
            {
              id: 2,
              name: "Jane Smith",
              email: "jane.smith@example.com",
              phone: "555-987-6543",
            },
            {
              id: 3,
              name: "Robert Johnson",
              email: "robert.johnson@example.com",
              phone: "555-456-7890",
            },
            {
              id: 4,
              name: "Maria Rodriguez",
              email: "maria.rodriguez@example.com",
              phone: "555-789-0123",
            },
            {
              id: 5,
              name: "David Wilson",
              email: "david.wilson@example.com",
              phone: "555-234-5678",
            },
          ]

          const mockOrders: Order[] = [
            {
              id: 1001,
              date: "2023-04-15T20:30:00",
              customer: mockCustomers[0],
              user: { id: 2, name: "Bartender 1" },
              items: [
                {
                  product: {
                    id: 1,
                    name: "Hoppy IPA",
                    price: 7.99,
                  },
                  quantity: 2,
                },
                {
                  product: {
                    id: 2,
                    name: "Dark Stout",
                    price: 8.49,
                  },
                  quantity: 1,
                },
              ],
              total: 24.47,
              status: "completed",
            },
            {
              id: 1002,
              date: "2023-04-15T21:15:00",
              customer: mockCustomers[1],
              user: { id: 3, name: "Bartender 2" },
              items: [
                {
                  product: {
                    id: 3,
                    name: "Golden Lager",
                    price: 6.99,
                  },
                  quantity: 4,
                },
              ],
              total: 27.96,
              status: "completed",
            },
            {
              id: 1003,
              date: "2023-04-16T19:45:00",
              customer: mockCustomers[2],
              user: { id: 2, name: "Bartender 1" },
              items: [
                {
                  product: {
                    id: 4,
                    name: "Amber Ale",
                    price: 7.49,
                  },
                  quantity: 2,
                },
                {
                  product: {
                    id: 7,
                    name: "Sour Cherry",
                    price: 8.99,
                  },
                  quantity: 1,
                },
              ],
              total: 23.97,
              status: "completed",
            },
            {
              id: 1004,
              date: "2023-04-18T18:30:00",
              customer: mockCustomers[0],
              user: { id: 3, name: "Bartender 2" },
              items: [
                {
                  product: {
                    id: 5,
                    name: "Wheat Beer",
                    price: 7.29,
                  },
                  quantity: 3,
                },
              ],
              total: 21.87,
              status: "completed",
            },
            {
              id: 1005,
              date: new Date().toISOString(),
              customer: mockCustomers[3],
              user: { id: 2, name: "Bartender 1" },
              items: [
                {
                  product: {
                    id: 6,
                    name: "Belgian Tripel",
                    price: 9.99,
                  },
                  quantity: 2,
                },
                {
                  product: {
                    id: 8,
                    name: "Porter",
                    price: 7.99,
                  },
                  quantity: 1,
                },
              ],
              total: 27.97,
              status: "in-progress",
            },
            {
              id: 1006,
              date: new Date().toISOString(),
              customer: mockCustomers[4],
              user: { id: 3, name: "Bartender 2" },
              items: [
                {
                  product: {
                    id: 1,
                    name: "Hoppy IPA",
                    price: 7.99,
                  },
                  quantity: 4,
                },
              ],
              total: 31.96,
              status: "in-progress",
            },
          ]

          setOrders(mockOrders)
          setCustomers(mockCustomers)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredOrders = orders.filter((order) => {
    // Filter by search term
    const searchMatch =
      order.id.toString().includes(searchTerm) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by date
    const dateMatch = dateFilter ? new Date(order.date).toDateString() === dateFilter.toDateString() : true

    // Filter by customer
    const customerMatch = customerFilter === "all" || order.customer.id.toString() === customerFilter

    // Filter by status
    const statusMatch = statusFilter === "all" || order.status === statusFilter

    return searchMatch && dateMatch && customerMatch && statusMatch
  })

  // Group orders by customer
  const ordersByCustomer = filteredOrders.reduce<Record<string, Order[]>>((acc, order) => {
    const customerId = order.customer.id.toString()
    if (!acc[customerId]) {
      acc[customerId] = []
    }
    acc[customerId].push(order)
    return acc
  }, {})

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
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
            </div>
          ) : Object.keys(ordersByCustomer).length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(ordersByCustomer).map(([customerId, customerOrders]) => {
                const customer = customers.find((c) => c.id.toString() === customerId)
                if (!customer) return null

                return (
                  <AccordionItem key={customerId} value={customerId}>
                    <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground px-4 rounded-md">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <span>{customer.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {customerOrders.length} orders
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
                              <TableHead>Status</TableHead>
                              <TableHead>Served By</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                                <TableCell>
                                  <ul className="list-disc list-inside">
                                    {order.items.map((item, index) => (
                                      <li key={index}>
                                        {item.quantity}x {item.product.name}
                                      </li>
                                    ))}
                                  </ul>
                                </TableCell>
                                <TableCell>${order.total.toFixed(2)}</TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                <TableCell>{order.user.name}</TableCell>
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
