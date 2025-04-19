"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  notes: string
  createdAt: string
}

export function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    // Fetch customers from your API
    const fetchCustomers = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('http://localhost:8000/api/v1/customers')
        // const data = await response.json()

        // For demo purposes, using mock data
        setTimeout(() => {
          const mockCustomers: Customer[] = [
            {
              id: 1,
              name: "John Doe",
              email: "john.doe@example.com",
              phone: "555-123-4567",
              address: "123 Main St, Anytown, USA",
              notes: "Regular customer, prefers IPAs",
              createdAt: "2023-01-15T10:30:00",
            },
            {
              id: 2,
              name: "Jane Smith",
              email: "jane.smith@example.com",
              phone: "555-987-6543",
              address: "456 Oak Ave, Somewhere, USA",
              notes: "Visits on weekends, likes stouts",
              createdAt: "2023-02-20T14:45:00",
            },
            {
              id: 3,
              name: "Robert Johnson",
              email: "robert.johnson@example.com",
              phone: "555-456-7890",
              address: "789 Pine Rd, Nowhere, USA",
              notes: "Member of the beer club, enjoys sour beers",
              createdAt: "2023-03-10T18:15:00",
            },
            {
              id: 4,
              name: "Maria Rodriguez",
              email: "maria.rodriguez@example.com",
              phone: "555-789-0123",
              address: "321 Elm St, Elsewhere, USA",
              notes: "Frequent visitor, prefers wheat beers",
              createdAt: "2023-03-25T20:30:00",
            },
            {
              id: 5,
              name: "David Wilson",
              email: "david.wilson@example.com",
              phone: "555-234-5678",
              address: "654 Maple Dr, Anywhere, USA",
              notes: "New customer, enjoys Belgian ales",
              createdAt: "2023-04-05T19:45:00",
            },
          ]
          setCustomers(mockCustomers)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch customers:", error)
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleAddCustomer = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would send to your API
      // const response = await fetch('http://localhost:8000/api/v1/customers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      // const data = await response.json()

      // For demo purposes, simulate adding to the list
      const newCustomer: Customer = {
        id: customers.length + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      }

      setCustomers([...customers, newCustomer])
      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      })

      toast({
        title: "Success",
        description: "Customer added successfully",
      })
    } catch (error) {
      console.error("Failed to add customer:", error)
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      })
    }
  }

  const handleEditCustomer = async () => {
    if (!currentCustomer) return

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would send to your API
      // const response = await fetch(`http://localhost:8000/api/v1/customers/${currentCustomer.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      // const data = await response.json()

      // For demo purposes, update the list
      const updatedCustomers = customers.map((customer) => {
        if (customer.id === currentCustomer.id) {
          return {
            ...customer,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            notes: formData.notes,
          }
        }
        return customer
      })

      setCustomers(updatedCustomers)
      setIsEditDialogOpen(false)
      setCurrentCustomer(null)

      toast({
        title: "Success",
        description: "Customer updated successfully",
      })
    } catch (error) {
      console.error("Failed to update customer:", error)
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCustomer = async (id: number) => {
    try {
      // In a real app, you would send to your API
      // await fetch(`http://localhost:8000/api/v1/customers/${id}`, {
      //   method: 'DELETE'
      // })

      // For demo purposes, update the list
      const updatedCustomers = customers.filter((customer) => customer.id !== id)
      setCustomers(updatedCustomers)

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete customer:", error)
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (customer: Customer) => {
    setCurrentCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
    })
    setIsEditDialogOpen(true)
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Add a new customer to your database.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomer}>Add Customer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>View and manage your customer database.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8 w-full md:max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Address</TableHead>
                    <TableHead className="hidden md:table-cell">Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="hidden md:table-cell">{customer.address}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {customer.notes.length > 30 ? `${customer.notes.substring(0, 30)}...` : customer.notes}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                Address
              </Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notes
              </Label>
              <Input
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCustomer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
