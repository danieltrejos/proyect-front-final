"use client"

import { useEffect, useState } from "react"
import { ArrowUpDown, RefreshCw, Package, AlertTriangle } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: number
  name: string
  type: string
  price: number
  stock: number
  description: string
}

export function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"name" | "stock">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [restockAmount, setRestockAmount] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.products}?all=true`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Product[] = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos desde la API.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: "name" | "stock") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    } else {
      return sortOrder === "asc" ? a.stock - b.stock : b.stock - a.stock
    }
  })

  const openRestockDialog = (product: Product) => {
    setCurrentProduct(product)
    setRestockAmount("")
    setIsRestockDialogOpen(true)
  }

  const handleRestock = async () => {
    if (!currentProduct) return

    try {
      const amount = Number.parseInt(restockAmount)

      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Por favor ingrese una cantidad válida",
          variant: "destructive",
        })
        return
      }

      // Enviar solicitud al API para reabastecer el producto
      const response = await fetch(`${API_ENDPOINTS.products}/${currentProduct.id}/restock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error HTTP: ${response.status}`)
      }

      // Obtener el producto actualizado desde la respuesta
      const updatedProduct = await response.json()

      // Actualizar la lista de productos localmente
      setProducts(products.map((product) => (product.id === currentProduct.id ? updatedProduct : product)))

      setIsRestockDialogOpen(false)
      setCurrentProduct(null)

      toast({
        title: "Éxito",
        description: `Se reabastecieron ${amount} unidades de ${currentProduct.name}`,
      })
    } catch (error) {
      console.error("Error al reabastecer producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo reabastecer el producto",
        variant: "destructive",
      })
    }
  }

  const getLowStockStatus = (stock: number) => {
    if (stock <= 100) return { variant: "destructive" as const, label: "Stock crítico" }
    if (stock <= 200) return { variant: "secondary" as const, label: "Stock bajo" }
    return { variant: "default" as const, label: "Stock normal" }
  }

  const getStockColor = (stock: number) => {
    if (stock <= 100) return "bg-red-500/10 text-red-500"
    if (stock <= 200) return "bg-yellow-500/10 text-yellow-500"
    return "bg-green-500/10 text-green-500"
  }

  // Estadísticas rápidas
  const lowStockCount = products.filter((p) => p.stock <= 100).length
  const totalProducts = products.length

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header - Mejorado para móviles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sistema de inventario</h1>
          {/* Estadísticas rápidas en móvil */}
          <div className="flex gap-2 mt-2 sm:hidden">
            <Badge variant="outline" className="text-xs">
              {totalProducts} productos
            </Badge>
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {lowStockCount} stock bajo
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {/* Estadísticas en desktop */}
          <div className="hidden sm:flex gap-2">
            <Badge variant="outline">{totalProducts} productos</Badge>
            {lowStockCount > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {lowStockCount} stock bajo
              </Badge>
            )}
          </div>
          <Button variant="outline" onClick={fetchProducts} disabled={isLoading} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar inventario
          </Button>
        </div>
      </div>

      {/* Controles de ordenamiento para móvil */}
      <div className="flex gap-2 sm:hidden">
        <Button
          variant={sortBy === "name" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("name")}
          className="flex-1"
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant={sortBy === "stock" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("stock")}
          className="flex-1"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventario de Productos
          </CardTitle>
          <CardDescription>Monitore y gestione el nivel de productos en inventario.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort("name")}>
                          Nombre
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort("stock")}>
                          Stock
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No se encontraron productos
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-md ${getStockColor(product.stock)}`}>
                              {product.stock} unidades
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => openRestockDialog(product)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Reabastecer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Vista de tarjetas para móvil */}
              <div className="sm:hidden space-y-3 p-4">
                {sortedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No se encontraron productos</p>
                  </div>
                ) : (
                  sortedProducts.map((product) => {
                    const stockStatus = getLowStockStatus(product.stock)
                    return (
                      <Card key={product.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">{product.type}</p>
                            </div>
                            {product.stock <= 100 && (
                              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 ml-2" />
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={stockStatus.variant} className="text-xs">
                                {product.stock} unidades
                              </Badge>
                              <span className="text-xs text-muted-foreground">{stockStatus.label}</span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRestockDialog(product)}
                            className="w-full"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reabastecer
                          </Button>

                          {product.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog para reabastecer - Mejorado para móviles */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Reabastecer Producto
            </DialogTitle>
            <DialogDescription>
              {currentProduct && `Agregar más unidades de ${currentProduct.name} a tu inventario.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Información del producto actual */}
            {currentProduct && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{currentProduct.name}</span>
                  <Badge variant="outline">{currentProduct.type}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Stock actual:</span>
                  <span className={`px-2 py-1 rounded-md ${getStockColor(currentProduct.stock)}`}>
                    {currentProduct.stock} unidades
                  </span>
                </div>
              </div>
            )}

            {/* Input para cantidad */}
            <div className="grid gap-2">
              <Label htmlFor="restock-amount">Cantidad a agregar</Label>
              <Input
                id="restock-amount"
                type="number"
                placeholder="Ingrese la cantidad"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                min="1"
              />
            </div>

            {/* Preview del nuevo stock */}
            {currentProduct && restockAmount && !isNaN(Number(restockAmount)) && Number(restockAmount) > 0 && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700">Nuevo stock:</span>
                  <span className="font-semibold text-green-700">
                    {currentProduct.stock + Number(restockAmount)} unidades
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleRestock} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reabastecer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
