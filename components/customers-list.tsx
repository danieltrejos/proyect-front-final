"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/lib/api-config"
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
import { toast } from "@/hooks/use-toast"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
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
  })
  useEffect(() => {
    // Fetch clientes del api del backend
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching customers from backend...")

        const response = await fetch(API_ENDPOINTS.customers)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Customers data received:", data)

        setCustomers(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch customers:", error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Fallo al cargar los clientes desde el servidor",
          variant: "destructive",
        })
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
          description: "Por favor, completa todos los campos requeridos",
          variant: "destructive",
        })
        return
      }

      console.log("Creating new customer:", formData)

      const response = await fetch(API_ENDPOINTS.customers, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newCustomer = await response.json()
      console.log("Customer created:", newCustomer)

      setCustomers([...customers, newCustomer])
      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
      })

      toast({
        title: "Success",
        description: "Cliente añadido correctamente",
      })
    } catch (error) {
      console.error("Failed to add customer:", error)
      toast({
        title: "Error",
        description: "Fallo al añadir el cliente",
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
          description: "Por favor, completa todos los campos requeridos",
          variant: "destructive",
        })
        return
      } console.log("Updating customer:", currentCustomer.id, formData)

      const response = await fetch(`${API_ENDPOINTS.customers}/${currentCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedCustomer = await response.json()
      console.log("✅ Cliente actualizado:", updatedCustomer)

      // Update the local state
      const updatedCustomers = customers.map((customer) => {
        if (customer.id === currentCustomer.id) {
          return updatedCustomer
        }
        return customer
      })

      setCustomers(updatedCustomers)
      setIsEditDialogOpen(false)
      setCurrentCustomer(null)

      toast({
        title: "Success",
        description: "Cliente actualizado satisfactoriamente",
      })
    } catch (error) {
      console.error("Failed to update customer:", error)
      toast({
        title: "Error",
        description: "Fallo al actualizar el cliente",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCustomer = async (id: number) => {
    // Delete functionality is disabled
    toast({
      title: "Information",
      description: "La función eliminar esta actualmente deshabilitada",
      variant: "default",
    })
  }

  const openEditDialog = (customer: Customer) => {
    setCurrentCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    })
    setIsEditDialogOpen(true)
  }
  const openAddDialog = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
    })
    setIsAddDialogOpen(true)
  }

  const closeAddDialog = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
    })
    setIsAddDialogOpen(false)
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
        <h1 className="text-3xl font-bold tracking-tight">Módulo Clientes</h1>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir cliente
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir nuevo cliente</DialogTitle>
            <DialogDescription>Añadir un nuevo cliente a la base de datos.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter customer name"
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
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefono
              </Label>                <Input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddDialog}>
              Cancelar
            </Button>
            <Button onClick={handleAddCustomer}>Añadir Cliente</Button>            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de clientes</CardTitle>
          <CardDescription>Ver y gestionar la base de datos de clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar clientes..."
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
            <div className="rounded-md border">              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha de creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(customer.createdAt).toLocaleDateString()}
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
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>                              <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCustomer(customer.id)}
                              disabled
                              className="text-muted-foreground"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete (Disabled)
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
            </div>            <div className="grid grid-cols-4 items-center gap-4">
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
