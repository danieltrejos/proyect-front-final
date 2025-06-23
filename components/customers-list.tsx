"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash, UserIcon, Mail, Phone, Calendar, Users } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      }

      console.log("Updating customer:", currentCustomer.id, formData)

      const response = await fetch(`${API_ENDPOINTS.customers}/${currentCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header - Mejorado para móviles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Módulo Clientes</h1>
          {/* Estadísticas rápidas en móvil */}
          <div className="flex gap-2 mt-2 sm:hidden">
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {filteredCustomers.length} clientes
            </Badge>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Filtrado
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {/* Estadísticas en desktop */}
          <div className="hidden sm:flex gap-2">
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {filteredCustomers.length} clientes
            </Badge>
            {searchTerm && <Badge variant="secondary">Filtrado</Badge>}
          </div>
          <Button onClick={openAddDialog} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Añadir cliente
          </Button>
        </div>
      </div>

      {/* Dialog para añadir cliente - Mejorado para móviles */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Añadir nuevo cliente
            </DialogTitle>
            <DialogDescription>Añadir un nuevo cliente a la base de datos.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Ingrese el nombre del cliente"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Ingrese el email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Ingrese el número de teléfono"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={closeAddDialog} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleAddCustomer} className="w-full sm:w-auto">
              Añadir Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de clientes
          </CardTitle>
          <CardDescription>Ver y gestionar la base de datos de clientes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Barra de búsqueda */}
          <div className="p-4 sm:p-0 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar clientes por nombre, email o teléfono..."
                className="pl-8"
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
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden sm:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead className="hidden md:table-cell">Fecha de creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          {searchTerm
                            ? "No se encontraron clientes que coincidan con la búsqueda"
                            : "No se encontraron clientes"}
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
                                  <span className="sr-only">Abrir menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                  disabled
                                  className="text-muted-foreground"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Eliminar (Disabled)
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

              {/* Vista de tarjetas para móvil */}
              <div className="sm:hidden space-y-4 p-4">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No se encontraron clientes que coincidan con la búsqueda"
                        : "No se encontraron clientes"}
                    </p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <Card key={customer.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{customer.name}</h3>
                            <Badge variant="outline" className="text-xs mt-1">
                              ID: {customer.id}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCustomer(customer.id)}
                                disabled
                                className="text-muted-foreground"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Eliminar (Disabled)
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="break-all">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Creado: {new Date(customer.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog para editar cliente - Mejorado para móviles */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Cliente
            </DialogTitle>
            <DialogDescription>Actualizar información del cliente.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Nombre
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre del cliente"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ingrese el email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Ingrese el número de teléfono"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleEditCustomer} className="w-full sm:w-auto">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
