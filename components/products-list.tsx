"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Trash, X, Filter } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"

const PRODUCT_TYPES = [
  "Amber Ale",
  "Blonde Ale",
  "Bock",
  "Cerveza",
  "Fruit Beer",
  "Gaseosa",
  "IPA",
  "Lager",
  "Pale Ale",
  "Pilsner",
  "Porter",
  "Stout",
  "Wheat Beer",
]

interface Product {
  id: number
  name: string
  type: string | null
  price: number
  stock: number
  description: string
  image?: string | null
  createdAt?: string
  updatedAt?: string
}

interface ProductFilters {
  page: number
  limit: number
  name?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
}

interface ProductResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// URL base de la API
const API_URL = API_ENDPOINTS.products

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)

  // Estado de paginación y filtros
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 10,
  })
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Estado inicial del formulario (strings para los inputs)
  const initialFormData = {
    name: "",
    type: "",
    price: "",
    stock: "",
    description: "",
    image: "",
  }
  const [formData, setFormData] = useState(initialFormData)

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("page", filters.page.toString())
      queryParams.append("limit", filters.limit.toString())

      if (filters.name) {
        queryParams.append("name", filters.name)
      }
      if (filters.type && filters.type !== "all") {
        queryParams.append("type", filters.type)
      }
      if (filters.minPrice !== undefined) {
        queryParams.append("minPrice", filters.minPrice.toString())
      }
      if (filters.maxPrice !== undefined) {
        queryParams.append("maxPrice", filters.maxPrice.toString())
      }
      if (filters.isActive !== undefined) {
        queryParams.append("isActive", filters.isActive.toString())
      }

      const url = `${API_URL}?${queryParams.toString()}`
      console.log("Fetching products from:", url)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ProductResponse = await response.json()
      console.log("Datos recibidos de la API:", data)

      setProducts(data.products)
      setTotalProducts(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Fallo al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos desde la API.",
        variant: "destructive",
      })
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Usar fetchProducts en useEffect
  useEffect(() => {
    fetchProducts()
  }, [filters]) // Se ejecuta cuando cambian los filtros

  // Manejo de cambios en filtros
  const handleFilterChange = (key: keyof ProductFilters, value: string | number | boolean | undefined) => {
    let processedValue = value

    // Si es "all", convertir a undefined para no enviarlo al backend
    if (value === "all") {
      processedValue = undefined
    }

    setFilters((prev) => ({
      ...prev,
      [key]: processedValue,
      page: key !== "page" ? 1 : typeof value === "number" ? value : 1, // Reset page when filters change
    }))
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      name: undefined,
      type: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      isActive: undefined,
    })
  }

  // Navegación de páginas
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      handleFilterChange("page", page)
    }
  }

  const goToPreviousPage = () => {
    if (filters.page > 1) {
      goToPage(filters.page - 1)
    }
  }

  const goToNextPage = () => {
    if (filters.page < totalPages) {
      goToPage(filters.page + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Implementar handleAddProduct con API
  const handleAddProduct = async () => {
    // Validación simple
    if (!formData.name || formData.price === "" || formData.stock === "") {
      toast({
        title: "Error de validación",
        description: "Nombre, Precio y Stock son requeridos.",
        variant: "destructive",
      })
      return
    }

    try {
      // Convertir precio y stock a números
      const priceNumber = Number.parseFloat(formData.price)
      const stockNumber = Number.parseInt(formData.stock, 10) // Usar base 10

      if (isNaN(priceNumber) || isNaN(stockNumber)) {
        toast({ title: "Error", description: "Precio y Stock deben ser números válidos.", variant: "destructive" })
        return
      }

      // Enviar datos a la API POST
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type === "" ? null : formData.type,
          price: priceNumber,
          stock: stockNumber,
          description: formData.description,
          image: formData.image || "URL_POR_DEFECTO_SI_APLICA",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Éxito",
        description: "Producto añadido correctamente.",
      })

      setIsAddDialogOpen(false)
      setFormData(initialFormData)
      await fetchProducts()
    } catch (error) {
      console.error("Fallo al añadir producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo añadir el producto.",
        variant: "destructive",
      })
    }
  }

  // Editar con PATCH A LA API
  const handleEditProduct = async () => {
    if (!currentProduct) return

    // Validación similar a la de añadir
    if (!formData.name || formData.price === "" || formData.stock === "") {
      toast({
        title: "Error de validación",
        description: "Nombre, Precio y Stock son requeridos.",
        variant: "destructive",
      })
      return
    }

    try {
      // Convertir precio y stock a números
      const priceNumber = Number.parseFloat(formData.price)
      const stockNumber = Number.parseInt(formData.stock, 10)

      if (isNaN(priceNumber) || isNaN(stockNumber)) {
        toast({ title: "Error", description: "Precio y Stock deben ser números válidos.", variant: "destructive" })
        return
      }

      // Enviar petición PATCH a la API
      const response = await fetch(`${API_URL}/${currentProduct.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type === "" ? null : formData.type,
          price: priceNumber,
          stock: stockNumber,
          description: formData.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente.",
      })

      setIsEditDialogOpen(false)
      setCurrentProduct(null)
      setFormData(initialFormData)
      await fetchProducts()
    } catch (error) {
      console.error("Fallo al actualizar producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el producto.",
        variant: "destructive",
      })
    }
  }

  // ELIMINAR PRODUCTO DESDE LA API
  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente.",
      })

      await fetchProducts()
    } catch (error) {
      console.error("Fallo al eliminar producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el producto.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      type: product.type ?? "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      image: product.image ?? "",
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header - Mejorado para móviles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Productos</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(isOpen) => {
              setIsAddDialogOpen(isOpen)
              if (!isOpen) setFormData(initialFormData)
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Agregar producto
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agrega un nuevo producto</DialogTitle>
                <DialogDescription>Añade un nuevo producto a tu inventario.</DialogDescription>
              </DialogHeader>

              {/* Formulario de Añadir - Mejorado para móviles */}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type || "sin-tipo"}
                    onValueChange={(value) => setFormData({ ...formData, type: value === "sin-tipo" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin-tipo">Sin tipo</SelectItem>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image">URL Imagen</Label>
                  <Input id="image" name="image" value={formData.image} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setFormData(initialFormData)
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddProduct} className="w-full sm:w-auto">
                  Agregar producto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Panel de Filtros - Mejorado para móviles */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtrar productos por diferentes criterios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Filtro de nombre */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="filter-name">Nombre</Label>
                <Input
                  id="filter-name"
                  placeholder="Buscar por nombre..."
                  value={filters.name || ""}
                  onChange={(e) => handleFilterChange("name", e.target.value || undefined)}
                />
              </div>

              {/* Filtro de tipo */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="filter-type">Tipo</Label>
                <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="Lager">Lager</SelectItem>
                    <SelectItem value="IPA">IPA</SelectItem>
                    <SelectItem value="Ale">Ale</SelectItem>
                    <SelectItem value="Stout">Stout</SelectItem>
                    <SelectItem value="Pilsner">Pilsner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros de precio en una sola fila en móvil */}
              <div className="flex flex-col space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label>Precio mínimo</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={filters.minPrice || ""}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="flex flex-col space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label>Precio máximo</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="999.99"
                  value={filters.maxPrice || ""}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              {/* Elementos por página */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="filter-limit">Por página</Label>
                <Select
                  value={filters.limit.toString()}
                  onValueChange={(value) => handleFilterChange("limit", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 productos</SelectItem>
                    <SelectItem value="10">10 productos</SelectItem>
                    <SelectItem value="20">20 productos</SelectItem>
                    <SelectItem value="50">50 productos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botones de acción de filtros */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 mt-4">
              <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Mostrando {products.length} de {totalProducts} productos
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Productos - Vista responsiva */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>Administra tu inventario y los detalles de los productos.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Cargando productos...</p>
            </div>
          ) : (
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No se encontraron productos.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.type ?? "N/A"}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>                                <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteProduct(product.id)}
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
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No se encontraron productos.</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>                              <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteProduct(product.id)}
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
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo:</span>
                            <span>{product.type ?? "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio:</span>
                            <span className="font-semibold">${product.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stock:</span>
                            <span>{product.stock}</span>
                          </div>
                          {product.description && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground">{product.description}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>

        {/* Controles de paginación - Mejorados para móviles */}
        {!isLoading && totalPages > 1 && (
          <CardContent className="pt-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Página {filters.page} de {totalPages} ({totalProducts} productos en total)
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={filters.page <= 1}>
                  Anterior
                </Button>

                {/* Páginas - Mostrar menos en móvil */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages) }, (_, i) => {
                    let pageNum: number
                    const maxPages = window.innerWidth < 640 ? 3 : 5

                    if (totalPages <= maxPages) {
                      pageNum = i + 1
                    } else if (filters.page <= Math.ceil(maxPages / 2)) {
                      pageNum = i + 1
                    } else if (filters.page >= totalPages - Math.floor(maxPages / 2)) {
                      pageNum = totalPages - maxPages + 1 + i
                    } else {
                      pageNum = filters.page - Math.floor(maxPages / 2) + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={filters.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button variant="outline" size="sm" onClick={goToNextPage} disabled={filters.page >= totalPages}>
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Dialog para Editar Producto - Mejorado para móviles */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          setIsEditDialogOpen(isOpen)
          if (!isOpen) {
            setCurrentProduct(null)
            setFormData(initialFormData)
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Actualiza los detalles de tu producto.</DialogDescription>
          </DialogHeader>

          {/* Formulario de Editar - Mejorado para móviles */}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select
                value={formData.type || "sin-tipo"}
                onValueChange={(value) => setFormData({ ...formData, type: value === "sin-tipo" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-tipo">Sin tipo</SelectItem>
                  {PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Precio</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  name="stock"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-image">URL imagen</Label>
              <Input
                id="edit-image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="URL de la imagen del producto"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setCurrentProduct(null)
                setFormData(initialFormData)
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button onClick={handleEditProduct} className="w-full sm:w-auto">
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}