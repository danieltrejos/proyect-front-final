"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Trash, DollarSign, CheckCircle, XCircle } from "lucide-react"
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

interface Currency {
  id: number
  name: string
  code: string
  symbol: string
  precision: number
  thousandSeparator: string
  decimalSeparator: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CurrencyFormData {
  name: string
  code: string
  symbol: string
  precision: string
  thousandSeparator: string
  decimalSeparator: string
}

const API_URL = "http://localhost:8000/api/v1/currencies"

export function CurrenciesManagement() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currencyToDelete, setCurrencyToDelete] = useState<Currency | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const initialFormData: CurrencyFormData = {
    name: "",
    code: "",
    symbol: "",
    precision: "2",
    thousandSeparator: ",",
    decimalSeparator: ".",
  }
  const [formData, setFormData] = useState<CurrencyFormData>(initialFormData)

  // Cargar currencies
  const fetchCurrencies = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Currency[] = await response.json()
      setCurrencies(data)
    } catch (error) {
      console.error("Error al cargar monedas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las monedas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrencies()
  }, [])

  // Manejar cambios en formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }  // Crear currency
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.symbol.trim()) {
      toast({
        title: "Error",
        description: "Los campos nombre, código y símbolo son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const precision = parseInt(formData.precision)
    if (isNaN(precision) || precision < 0 || precision > 10) {
      toast({
        title: "Error",
        description: "La precisión debe ser un número entre 0 y 10.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          symbol: formData.symbol,
          precision: precision,
          thousandSeparator: formData.thousandSeparator,
          decimalSeparator: formData.decimalSeparator,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      await fetchCurrencies()
      setIsAddDialogOpen(false)
      setFormData(initialFormData)
      toast({
        title: "Éxito",
        description: "Moneda creada exitosamente.",
      })
    } catch (error: any) {
      console.error("Error al crear moneda:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la moneda.",
        variant: "destructive",
      })
    }
  }
  // Editar currency
  const handleEdit = async () => {
    if (!currentCurrency || !formData.name.trim() || !formData.code.trim() || !formData.symbol.trim()) {
      toast({
        title: "Error",
        description: "Los campos nombre, código y símbolo son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const precision = parseInt(formData.precision)
    if (isNaN(precision) || precision < 0 || precision > 10) {
      toast({
        title: "Error",
        description: "La precisión debe ser un número entre 0 y 10.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`${API_URL}/${currentCurrency.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          symbol: formData.symbol,
          precision: precision,
          thousandSeparator: formData.thousandSeparator,
          decimalSeparator: formData.decimalSeparator,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      await fetchCurrencies()
      setIsEditDialogOpen(false)
      setCurrentCurrency(null)
      setFormData(initialFormData)
      toast({
        title: "Éxito",
        description: "Moneda actualizada exitosamente.",
      })
    } catch (error: any) {
      console.error("Error al actualizar moneda:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la moneda.",
        variant: "destructive",
      })
    }
  }

  // Eliminar currency
  const handleDelete = async () => {
    if (!currencyToDelete) return

    try {
      const response = await fetch(`${API_URL}/${currencyToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      await fetchCurrencies()
      setDeleteDialogOpen(false)
      setCurrencyToDelete(null)
      toast({
        title: "Éxito",
        description: "Moneda eliminada exitosamente.",
      })
    } catch (error: any) {
      console.error("Error al eliminar moneda:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la moneda.",
        variant: "destructive",
      })
    }
  }

  // Activar/Desactivar currency
  const toggleCurrencyStatus = async (currency: Currency) => {
    try {
      const endpoint = currency.isActive 
        ? `${API_URL}/${currency.id}/deactivate`
        : `${API_URL}/${currency.id}/activate`

      const response = await fetch(endpoint, {
        method: "PATCH",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      await fetchCurrencies()
      toast({
        title: "Éxito",
        description: `Moneda ${currency.isActive ? 'desactivada' : 'activada'} exitosamente.`,
      })
    } catch (error: any) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado de la moneda.",
        variant: "destructive",
      })
    }
  }
  // Preparar edición
  const prepareEdit = (currency: Currency) => {
    setCurrentCurrency(currency)
    setFormData({
      name: currency.name,
      code: currency.code,
      symbol: currency.symbol,
      precision: currency.precision.toString(),
      thousandSeparator: currency.thousandSeparator,
      decimalSeparator: currency.decimalSeparator,
    })
    setIsEditDialogOpen(true)
  }

  // Preparar eliminación
  const prepareDelete = (currency: Currency) => {
    setCurrencyToDelete(currency)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando monedas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Monedas</h1>
          <p className="text-muted-foreground">
            Administra las monedas disponibles en el sistema
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Moneda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Moneda</DialogTitle>
              <DialogDescription>
                Ingresa los detalles de la nueva moneda.
              </DialogDescription>
            </DialogHeader>            <div className="grid gap-4 py-4">
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
                  placeholder="ej. Peso Colombiano"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Código
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="ej. COP"
                  maxLength={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbol" className="text-right">
                  Símbolo
                </Label>
                <Input
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="ej. $"
                  maxLength={5}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="precision" className="text-right">
                  Precisión
                </Label>
                <Input
                  id="precision"
                  name="precision"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.precision}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="ej. 2"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="thousandSeparator" className="text-right">
                  Sep. Miles
                </Label>
                <Input
                  id="thousandSeparator"
                  name="thousandSeparator"
                  value={formData.thousandSeparator}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="ej. ,"
                  maxLength={1}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="decimalSeparator" className="text-right">
                  Sep. Decimales
                </Label>
                <Input
                  id="decimalSeparator"
                  name="decimalSeparator"
                  value={formData.decimalSeparator}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="ej. ."
                  maxLength={1}
                />
              </div>
            </div>            <DialogFooter>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creando..." : "Crear Moneda"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monedas Registradas
          </CardTitle>
          <CardDescription>
            Lista de todas las monedas configuradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Símbolo</TableHead>
                <TableHead>Precisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((currency) => (                <TableRow key={currency.id}>
                  <TableCell className="font-medium">{currency.name}</TableCell>
                  <TableCell>{currency.code}</TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>{currency.precision}</TableCell>
                  <TableCell>
                    <Badge variant={currency.isActive ? "default" : "secondary"}>
                      {currency.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(currency.createdAt).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => prepareEdit(currency)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleCurrencyStatus(currency)}
                        >
                          {currency.isActive ? (
                            <XCircle className="mr-2 h-4 w-4" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          {currency.isActive ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => prepareDelete(currency)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}              {currencies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay monedas registradas
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
            <DialogTitle>Editar Moneda</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la moneda.
            </DialogDescription>
          </DialogHeader>          <div className="grid gap-4 py-4">
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Código
              </Label>
              <Input
                id="edit-code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="col-span-3"
                maxLength={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-symbol" className="text-right">
                Símbolo
              </Label>
              <Input
                id="edit-symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                className="col-span-3"
                maxLength={5}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-precision" className="text-right">
                Precisión
              </Label>
              <Input
                id="edit-precision"
                name="precision"
                type="number"
                min="0"
                max="10"
                value={formData.precision}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-thousandSeparator" className="text-right">
                Sep. Miles
              </Label>
              <Input
                id="edit-thousandSeparator"
                name="thousandSeparator"
                value={formData.thousandSeparator}
                onChange={handleInputChange}
                className="col-span-3"
                maxLength={1}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-decimalSeparator" className="text-right">
                Sep. Decimales
              </Label>
              <Input
                id="edit-decimalSeparator"
                name="decimalSeparator"
                value={formData.decimalSeparator}
                onChange={handleInputChange}
                className="col-span-3"
                maxLength={1}
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
              Esta acción no se puede deshacer. Esto eliminará permanentemente la moneda
              "{currencyToDelete?.name}" del sistema.
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
