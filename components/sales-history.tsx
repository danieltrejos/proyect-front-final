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

interface Sale {
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
  paymentMethod: string
}

export function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [customerFilter, setCustomerFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([])
  const [users, setUsers] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    // Fetch sales history from your API
    const fetchSalesHistory = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('http://localhost:8000/api/v1/sales')
        // const data = await response.json()

        // For demo purposes, using mock data
        setTimeout(() => {
          const mockCustomers = [
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Smith" },
            { id: 3, name: "Robert Johnson" },
            { id: 4, name: "Maria Rodriguez" },
            { id: 5, name: "David Wilson" },
          ]

          const mockUsers = [
            { id: 1, name: "Admin User" },
            { id: 2, name: "Bartender 1" },
            { id: 3, name: "Bartender 2" },
          ]

          const mockSales: Sale[] = [
            {
              id: 1,
              date: "2023-04-15T20:30:00",
              customer: mockCustomers[0],
              user: mockUsers[1],
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
              paymentMethod: "Credit Card",
            },
            {
              id: 2,
              date: "2023-04-15T21:15:00",
              customer: mockCustomers[1],
              user: mockUsers[2],
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
              paymentMethod: "Cash",
            },
            {
              id: 3,
              date: "2023-04-16T19:45:00",
              customer: mockCustomers[2],
              user: mockUsers[1],
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
              paymentMethod: "Credit Card",
            },
            {
              id: 4,
              date: "2023-04-16T22:30:00",
              customer: mockCustomers[3],
              user: mockUsers[2],
              items: [
                {
                  product: {
                    id: 5,
                    name: "Wheat Beer",
                    price: 7.29,
                  },
                  quantity: 2,
                },
                {
                  product: {
                    id: 1,
                    name: "Hoppy IPA",
                    price: 7.99,
                  },
                  quantity: 1,
                },
              ],
              total: 22.57,
              paymentMethod: "Cash",
            },
            {
              id: 5,
              date: "2023-04-17T20:15:00",
              customer: mockCustomers[4],
              user: mockUsers[1],
              items: [
                {
                  product: {
                    id: 6,
                    name: "Belgian Tripel",
                    price: 9.99,
                  },
                  quantity: 3,
                },
              ],
              total: 29.97,
              paymentMethod: "Credit Card",
            },
          ]

          setSales(mockSales)
          setCustomers(mockCustomers)
          setUsers(mockUsers)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch sales history:", error)
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
    const dateMatch = dateFilter ? new Date(sale.date).toDateString() === dateFilter.toDateString() : true

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
      new Date(sale.date).toLocaleString(),
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
        <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
          <CardDescription>View and filter your sales history.</CardDescription>
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
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dateFilter && (
                <Button variant="ghost" onClick={() => setDateFilter(undefined)} className="px-3">
                  Clear Filters
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
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No sales records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.id}</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {sale.customer.name}
                          </div>
                        </TableCell>
                        <TableCell>{sale.user.name}</TableCell>
                        <TableCell>
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
