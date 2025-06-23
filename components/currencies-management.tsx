"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Edit,
  MoreHorizontal,
  Plus,
  Trash,
  DollarSign,
  CheckCircle,
  XCircle,
  Hash,
  Type,
  Settings,
  Calendar,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Coins,
} from "lucide-react"
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
      const response = await fetch(API_ENDPOINTS.currencies)
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Crear currency
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.symbol.trim()) {
      toast({
        title: "Error",
        description: "Los campos nombre, código y símbolo son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const precision = Number.parseInt(formData.precision)
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
      const response = await fetch(API_ENDPOINTS.currencies, {
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
    } finally {
      setIsCreating(false)
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

    const precision = Number.parseInt(formData.precision)
    if (isNaN(precision) || precision < 0 || precision > 10) {
      toast({
        title: "Error",
        description: "La precisión debe ser un número entre 0 y 10.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.currencies}/${currentCurrency.id}`, {
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
    } finally {
      setIsUpdating(false)
    }
  }

  // Eliminar currency
  const handleDelete = async () => {
    if (!currencyToDelete) return

    try {
      const response = await fetch(`${API_ENDPOINTS.currencies}/${currencyToDelete.id}`, {
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
        ? `${API_ENDPOINTS.currencies}/${currency.id}/deactivate`
        : `${API_ENDPOINTS.currencies}/${currency.id}/activate`

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
        description: `Moneda ${currency.isActive ? "desactivada" : "activada"} exitosamente.`,
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

  // Formatear ejemplo de moneda
  const formatCurrencyExample = (currency: Currency, amount = 1234.56) => {
    const parts = amount.toFixed(currency.precision).split(".")
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator)
    const decimalPart = parts[1] || ""

    if (currency.precision === 0) {
      return `${currency.symbol}${integerPart}`
    }

    return `${currency.symbol}${integerPart}${currency.decimalSeparator}${decimalPart}`
  }

  // Estadísticas
  const activeCurrencies = currencies.filter((currency) => currency.isActive).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header - Mejorado para móviles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Monedas</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Administra las monedas disponibles en el sistema</p>
          {/* Estadísticas rápidas en móvil */}
          <div className="flex gap-2 mt-2 sm:hidden">
            <Badge variant="outline" className="text-xs">
              <Coins className="w-3 h-3 mr-1" />
              {currencies.length} monedas
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              {activeCurrencies} activas
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {/* Estadísticas en desktop */}
          <div className="hidden sm:flex gap-2">
            <Badge variant="outline">
              <Coins className="w-3 h-3 mr-1" />
              {currencies.length} monedas
            </Badge>
            <Badge variant="secondary">
              <CheckCircle className="w-3 h-3 mr-1" />
              {activeCurrencies} activas
            </Badge>
          </div>
          <Button onClick={fetchCurrencies} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Moneda
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Agregar Nueva Moneda
                </DialogTitle>
                <DialogDescription>Ingresa los detalles de la nueva moneda.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Nombre de la Moneda
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ej. Peso Colombiano"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code" className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Código (3 letras)
                    </Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="ej. COP"
                      maxLength={3}
                      className="uppercase"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="symbol" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Símbolo
                    </Label>
                    <Input
                      id="symbol"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      placeholder="ej. $"
                      maxLength={5}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="precision" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Precisión Decimal (0-10)
                  </Label>
                  <Input
                    id="precision"
                    name="precision"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.precision}
                    onChange={handleInputChange}
                    placeholder="ej. 2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="thousandSeparator" className="text-sm">
                      Separador de Miles
                    </Label>
                    <Input
                      id="thousandSeparator"
                      name="thousandSeparator"
                      value={formData.thousandSeparator}
                      onChange={handleInputChange}
                      placeholder="ej. ,"
                      maxLength={1}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="decimalSeparator" className="text-sm">
                      Separador Decimal
                    </Label>
                    <Input
                      id="decimalSeparator"
                      name="decimalSeparator"
                      value={formData.decimalSeparator}
                      onChange={handleInputChange}
                      placeholder="ej. ."
                      maxLength={1}
                    />
                  </div>
                </div>
                {/* Vista previa del formato */}
                {formData.symbol && formData.precision && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <Label className="text-xs font-medium text-muted-foreground">Vista previa:</Label>
                    <div className="font-mono text-sm mt-1">
                      {formData.symbol}1{formData.thousandSeparator}234
                      {Number.parseInt(formData.precision) > 0 && (
                        <>
                          {formData.decimalSeparator}
                          {"0".repeat(Number.parseInt(formData.precision) || 0)}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={isCreating} className="w-full sm:w-auto">
                  {isCreating ? "Creando..." : "Crear Moneda"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monedas Registradas
          </CardTitle>
          <CardDescription>Lista de todas las monedas configuradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block rounded-md border">
            <Table>
              <TableHeader>
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
                {currencies.map((currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">{currency.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{currency.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-lg">{currency.symbol}</span>
                    </TableCell>
                    <TableCell>{currency.precision} decimales</TableCell>
                    <TableCell>
                      <Badge variant={currency.isActive ? "default" : "secondary"}>
                        {currency.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activa
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactiva
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(currency.createdAt).toLocaleDateString()}</TableCell>
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
                          <DropdownMenuItem onClick={() => toggleCurrencyStatus(currency)}>
                            {currency.isActive ? (
                              <XCircle className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {currency.isActive ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => prepareDelete(currency)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {currencies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No hay monedas registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vista de tarjetas para móvil y tablet */}
          <div className="lg:hidden space-y-4 p-4">
            {currencies.length === 0 ? (
              <div className="text-center py-8">
                <Coins className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay monedas registradas</p>
              </div>
            ) : (
              currencies.map((currency) => (
                <Card key={currency.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{currency.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-sm">
                            <Hash className="w-3 h-3 mr-1" />
                            {currency.code}
                          </Badge>
                          <Badge variant="secondary" className="text-sm">
                            <span className="font-mono">{currency.symbol}</span>
                          </Badge>
                          <Badge variant={currency.isActive ? "default" : "secondary"} className="text-xs">
                            {currency.isActive ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Activa
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactiva
                              </>
                            )}
                          </Badge>
                        </div>
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
                          <DropdownMenuItem onClick={() => prepareEdit(currency)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleCurrencyStatus(currency)}>
                            {currency.isActive ? (
                              <XCircle className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {currency.isActive ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => prepareDelete(currency)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Precisión:</span>
                        <span>{currency.precision} decimales</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Formato:</span>
                        <span className="font-mono">{formatCurrencyExample(currency)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Separadores:</span>
                        <span className="font-mono">
                          Miles: "{currency.thousandSeparator}" | Decimal: "{currency.decimalSeparator}"
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Creada: {new Date(currency.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Acciones rápidas en móvil */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCurrencyStatus(currency)}
                        className="flex-1"
                      >
                        {currency.isActive ? (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4 mr-2" />
                            Activar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edición - Mejorado para móviles */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Moneda
            </DialogTitle>
            <DialogDescription>Modifica los detalles de la moneda.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Nombre de la Moneda
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="ej. Peso Colombiano"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Código (3 letras)
                </Label>
                <Input
                  id="edit-code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="ej. COP"
                  maxLength={3}
                  className="uppercase"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-symbol" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Símbolo
                </Label>
                <Input
                  id="edit-symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  placeholder="ej. $"
                  maxLength={5}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-precision" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Precisión Decimal (0-10)
              </Label>
              <Input
                id="edit-precision"
                name="precision"
                type="number"
                min="0"
                max="10"
                value={formData.precision}
                onChange={handleInputChange}
                placeholder="ej. 2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-thousandSeparator" className="text-sm">
                  Separador de Miles
                </Label>
                <Input
                  id="edit-thousandSeparator"
                  name="thousandSeparator"
                  value={formData.thousandSeparator}
                  onChange={handleInputChange}
                  placeholder="ej. ,"
                  maxLength={1}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-decimalSeparator" className="text-sm">
                  Separador Decimal
                </Label>
                <Input
                  id="edit-decimalSeparator"
                  name="decimalSeparator"
                  value={formData.decimalSeparator}
                  onChange={handleInputChange}
                  placeholder="ej. ."
                  maxLength={1}
                />
              </div>
            </div>
            {/* Vista previa del formato */}
            {formData.symbol && formData.precision && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-xs font-medium text-muted-foreground">Vista previa:</Label>
                <div className="font-mono text-sm mt-1">
                  {formData.symbol}1{formData.thousandSeparator}234
                  {Number.parseInt(formData.precision) > 0 && (
                    <>
                      {formData.decimalSeparator}
                      {"0".repeat(Number.parseInt(formData.precision) || 0)}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isUpdating} className="w-full sm:w-auto">
              {isUpdating ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación - Mejorado para móviles */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash className="h-5 w-5 text-red-500" />
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la moneda "
              <span className="font-semibold">{currencyToDelete?.name}</span>" (
              <span className="font-mono">{currencyToDelete?.code}</span>) del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
