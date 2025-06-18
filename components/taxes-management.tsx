"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Trash, Calculator, CheckCircle, XCircle, Star } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Tax {
  id: number
  name: string
  rate: number
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface TaxFormData {
  name: string
  rate: string
}

export function TaxesManagement() {
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentTax, setCurrentTax] = useState<Tax | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const initialFormData: TaxFormData = {
    name: "",
    rate: "",
  }
  const [formData, setFormData] = useState<TaxFormData>(initialFormData)

  // Cargar taxes
  const fetchTaxes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.taxes)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Tax[] = await response.json()
      setTaxes(data)
    } catch (error) {
      console.error("Error al cargar impuestos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los impuestos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTaxes()
  }, [])

  // Manejar cambios en formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  // Crear tax
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.rate.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const rate = parseFloat(formData.rate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "Error",
        description: "El porcentaje debe ser un número entre 0 y 100.",
        variant: "destructive",
      })
      return
    } setIsCreating(true)
    try {
      const response = await fetch(API_ENDPOINTS.taxes, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          rate: rate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      await fetchTaxes()
      setIsAddDialogOpen(false)
      setFormData(initialFormData)
      toast({
        title: "Éxito",
        description: "Impuesto creado exitosamente.",
      })
    } catch (error: any) {
      console.error("Error al crear impuesto:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el impuesto.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }
  // Editar tax
  const handleEdit = async () => {
    if (!currentTax || !formData.name.trim() || !formData.rate.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const rate = parseFloat(formData.rate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "Error",
        description: "El porcentaje debe ser un número entre 0 y 100.",
        variant: "destructive",
      })
      return
    } setIsUpdating(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.taxes}/${currentTax.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          rate: rate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      await fetchTaxes()
      setIsEditDialogOpen(false)
      setCurrentTax(null)
      setFormData(initialFormData)
      toast({
        title: "Éxito",
        description: "Impuesto actualizado exitosamente.",
      })
    } catch (error: any) {
      console.error("Error al actualizar impuesto:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el impuesto.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Eliminar tax
  const handleDelete = async () => {
    if (!taxToDelete) return

    try {
      const response = await fetch(`${API_ENDPOINTS.taxes}/${taxToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      await fetchTaxes()
      setDeleteDialogOpen(false)
      setTaxToDelete(null)
      toast({
        title: "Éxito",
        description: "Impuesto eliminado exitosamente.",
      })
    } catch (error: any) {
      console.error("Error al eliminar impuesto:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el impuesto.",
        variant: "destructive",
      })
    }
  }

  // Activar/Desactivar tax
  const toggleTaxStatus = async (tax: Tax) => {
    try {
      const endpoint = tax.isActive
        ? `${API_ENDPOINTS.taxes}/${tax.id}/deactivate`
        : `${API_ENDPOINTS.taxes}/${tax.id}/activate`

      const response = await fetch(endpoint, {
        method: "PATCH",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      await fetchTaxes()
      toast({
        title: "Éxito",
        description: `Impuesto ${tax.isActive ? 'desactivado' : 'activado'} exitosamente.`,
      })
    } catch (error: any) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado del impuesto.",
        variant: "destructive",
      })
    }
  }

  // Establecer como predeterminado
  const setAsDefault = async (tax: Tax) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.taxes}/${tax.id}/set-default`, {
        method: "PATCH",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      await fetchTaxes()
      toast({
        title: "Éxito",
        description: "Impuesto establecido como predeterminado.",
      })
    } catch (error: any) {
      console.error("Error al establecer como predeterminado:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo establecer como predeterminado.",
        variant: "destructive",
      })
    }
  }
  // Preparar edición
  const prepareEdit = (tax: Tax) => {
    setCurrentTax(tax)
    setFormData({
      name: tax.name,
      rate: tax.rate.toString(),
    })
    setIsEditDialogOpen(true)
  }

  // Preparar eliminación
  const prepareDelete = (tax: Tax) => {
    setTaxToDelete(tax)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando impuestos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Impuestos</h1>
          <p className="text-muted-foreground">
            Administra los impuestos disponibles en el sistema
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Impuesto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Impuesto</DialogTitle>
              <DialogDescription>
                Ingresa los detalles del nuevo impuesto.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="ej. IVA"
                />
              </div>              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rate" className="text-right">
                  Porcentaje
                </Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.rate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="ej. 19"
                />
              </div>
            </div>            <DialogFooter>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creando..." : "Crear Impuesto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Impuestos Registrados
          </CardTitle>
          <CardDescription>
            Lista de todos los impuestos configurados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Porcentaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Predeterminado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxes.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell className="font-medium">{tax.name}</TableCell>
                  <TableCell>{tax.rate}%</TableCell>
                  <TableCell>
                    <Badge variant={tax.isActive ? "default" : "secondary"}>
                      {tax.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tax.isDefault && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Star className="w-3 h-3 mr-1" />
                        Predeterminado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(tax.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => prepareEdit(tax)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleTaxStatus(tax)}
                        >
                          {tax.isActive ? (
                            <XCircle className="mr-2 h-4 w-4" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          {tax.isActive ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                        {!tax.isDefault && tax.isActive && (
                          <DropdownMenuItem onClick={() => setAsDefault(tax)}>
                            <Star className="mr-2 h-4 w-4" />
                            Establecer como predeterminado
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => prepareDelete(tax)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {taxes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay impuestos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Impuesto</DialogTitle>
            <DialogDescription>
              Modifica los detalles del impuesto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-rate" className="text-right">
                Porcentaje
              </Label>
              <Input
                id="edit-rate"
                name="rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.rate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>          <DialogFooter>
            <Button onClick={handleEdit} disabled={isUpdating}>
              {isUpdating ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el impuesto
              "{taxToDelete?.name}" del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
