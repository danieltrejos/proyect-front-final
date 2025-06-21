"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Trash, Search, X, Filter } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"

const PRODUCT_TYPES = [
  'Amber Ale',
  'Blonde Ale',
  'Bock',
  'Cerveza',
  'Fruit Beer',
  'Gaseosa',
  'IPA',
  'Lager',
  'Pale Ale',
  'Pilsner',
  'Porter',
  'Stout',
  'Wheat Beer'
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
    limit: 10
  })
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilters, setShowFilters] = useState(false)


  // Estado inicial del formulario (strings para los inputs)
  const initialFormData = {
    name: "",
    // Permitir cadena vacía o el tipo actual para edición
    type: "",
    price: "",
    stock: "",
    description: "",
    // Opcional: añadir campo para la imagen si la gestionas en el formulario
    image: ""
  }
  const [formData, setFormData] = useState(initialFormData)
  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams()
      queryParams.append('page', filters.page.toString())
      queryParams.append('limit', filters.limit.toString())

      if (filters.name) {
        queryParams.append('name', filters.name)
      }
      if (filters.type && filters.type !== 'all') {
        queryParams.append('type', filters.type)
      }
      if (filters.minPrice !== undefined) {
        queryParams.append('minPrice', filters.minPrice.toString())
      }
      if (filters.maxPrice !== undefined) {
        queryParams.append('maxPrice', filters.maxPrice.toString())
      }
      if (filters.isActive !== undefined) {
        queryParams.append('isActive', filters.isActive.toString())
      }

      const url = `${API_URL}?${queryParams.toString()}`
      console.log('Fetching products from:', url)

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

    setFilters(prev => ({
      ...prev,
      [key]: processedValue,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1) // Reset page when filters change
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
      isActive: undefined
    })
  }

  // Navegación de páginas
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      handleFilterChange('page', page)
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

  // Implementar handleAddProduct con API ---
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
      // Convertir precio y stock a números ---
      const priceNumber = Number.parseFloat(formData.price)
      const stockNumber = Number.parseInt(formData.stock, 10) // Usar base 10

      if (isNaN(priceNumber) || isNaN(stockNumber)) {
        toast({ title: "Error", description: "Precio y Stock deben ser números válidos.", variant: "destructive" })
        return
      }

      //! Enviar datos a la API POST
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Aqui otros headers si son necesarios (ej: Authorization)
        },
        body: JSON.stringify({
          name: formData.name,
          // Enviar null si el tipo está vacío, o el valor
          type: formData.type === "" ? null : formData.type,
          price: priceNumber,
          stock: stockNumber,
          description: formData.description,
          //! Cambiar: enviar la URL de la imagen
          image: formData.image || 'URL_POR_DEFECTO_SI_APLICA'
        }),
      })

      if (!response.ok) {
        // Intentar leer el mensaje de error del backend si existe
        const errorData = await response.json().catch(() => ({})) // Evita error si el body no es JSON
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // const newProductFromApi = await response.json() // Opcional: usar el producto devuelto

      toast({
        title: "Éxito",
        description: "Producto añadido correctamente.",
      })

      setIsAddDialogOpen(false) // Cerrar el modal
      setFormData(initialFormData) // Limpiar el formulario
      await fetchProducts() // --- MODIFICACIÓN: Volver a cargar la lista de productos ---

    } catch (error) {
      console.error("Fallo al añadir producto:", error)
      toast({
        title: "Error",
        // Mostrar mensaje de error específico si es posible
        description: error instanceof Error ? error.message : "No se pudo añadir el producto.",
        variant: "destructive",
      })
    }
  }

  //!  Editar con PATCH A LA API ---
  const handleEditProduct = async () => {
    if (!currentProduct) return

    // Validación similar a la de añadir
    if (!formData.name || formData.price === "" || formData.stock === "") {
      toast({ title: "Error de validación", description: "Nombre, Precio y Stock son requeridos.", variant: "destructive" })
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

      //!Enviar petición PUT a la API ---
      const response = await fetch(`${API_URL}/${currentProduct.id}`, {
        method: 'PATCH', // PATCH la soporta actualizaciones parciales
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type === "" ? null : formData.type,
          price: priceNumber,
          stock: stockNumber,
          description: formData.description,
          // Opcional: image: formData.image
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // const updatedProductFromApi = await response.json() // Opcional

      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente.",
      })

      setIsEditDialogOpen(false) // Cerrar diálogo
      setCurrentProduct(null) // Limpiar producto actual
      setFormData(initialFormData) // Limpiar formulario (opcional, podrías querer mantenerlo)
      await fetchProducts() // --- MODIFICACIÓN: Volver a cargar la lista ---

    } catch (error) {
      console.error("Fallo al actualizar producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el producto.",
        variant: "destructive",
      })
    }
  }

  //! ELIMINAR PRODUCTO DESDE LA API 
  const handleDeleteProduct = async (id: number) => {
    // Opcional: Añadir confirmación antes de borrar
    // if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    //   return;
    // }

    try {
      // --- MODIFICACIÓN: Enviar petición DELETE a la API ---
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        // El backend podría no devolver body en un DELETE exitoso (status 204 No Content)
        // pero sí en un error
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente.",
      })

      await fetchProducts() // --- MODIFICACIÓN: Volver a cargar la lista ---
      // Alternativa si no quieres recargar toda la lista:
      // setProducts(products.filter((product) => product.id !== id));

    } catch (error) {
      console.error("Fallo al eliminar producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el producto.",
        variant: "destructive",
      })
    }
  }
  //! --- MODIFICACIÓN: Ajustar openEditDialog para manejar tipo null ---
  const openEditDialog = (product: Product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      // Si el tipo es null, poner cadena vacía en el input, sino, el valor
      type: product.type ?? "",
      price: product.price.toString(), // Convertir a string para el input
      stock: product.stock.toString(), // Convertir a string para el input
      description: product.description,
      // Opcional: image: product.image || ""
      image: product.image ?? ""
    })
    setIsEditDialogOpen(true)
  }
  return (
    <div className="flex flex-col gap-6">
      {/* Botón Agregar Producto y su Dialog */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
            setIsAddDialogOpen(isOpen);
            if (!isOpen) setFormData(initialFormData); // Limpiar form al cerrar
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar producto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                {/* --- Títulos más genéricos --- */}
                <DialogTitle>Agrega un nuevo producto</DialogTitle>
                <DialogDescription>Añade un nuevo producto a tu inventario.</DialogDescription>
              </DialogHeader>

              {/* Formulario de Añadir (asegúrate que los 'name' coincidan con formData) */}
              <div className="grid gap-4 py-4">
                {/* Input Nombre */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nombre</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
                </div>                {/* Input Tipo */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Tipo</Label>
                  <Select
                    value={formData.type || "sin-tipo"}
                    onValueChange={(value) => setFormData({ ...formData, type: value === "sin-tipo" ? "" : value })}
                  >
                    <SelectTrigger className="col-span-3">
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

                {/* Input Precio */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Precio</Label>
                  <Input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} className="col-span-3" />
                </div>

                {/* Input Stock */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock</Label>
                  <Input id="stock" name="stock" type="number" step="1" min="0" value={formData.stock} onChange={handleInputChange} className="col-span-3" />
                </div>

                {/* Input URL-image */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">URL Imagen</Label>
                  <Input id="image" name="image" value={formData.image} onChange={handleInputChange} className="col-span-3" />
                </div>

                {/* Input Descripción */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Descripción</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" />
                </div>
                {/* Opcional: Input para Imagen si se gestiona */}
                {/* <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="image" className="text-right">URL Imagen</Label>
                   <Input id="image" name="image" value={formData.image} onChange={handleInputChange} className="col-span-3" />
                 </div> */}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setFormData(initialFormData); }}>Cancelar</Button>
                <Button onClick={handleAddProduct}>Agregar producto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtrar productos por diferentes criterios</CardDescription>
          </CardHeader>
          <CardContent>            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filtro de nombre */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="filter-name">Nombre</Label>
              <Input
                id="filter-name"
                placeholder="Buscar por nombre..."
                value={filters.name || ''}
                onChange={(e) => handleFilterChange('name', e.target.value || undefined)}
              />
            </div>

            {/* Filtro de tipo */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="filter-type">Tipo</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
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

            {/* Filtro de precio mínimo */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="filter-min-price">Precio mínimo</Label>
              <Input
                id="filter-min-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            {/* Filtro de precio máximo */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="filter-max-price">Precio máximo</Label>
              <Input
                id="filter-max-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="999.99"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            {/* Elementos por página */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="filter-limit">Por página</Label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => handleFilterChange('limit', Number(value))}
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
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
              <div className="text-sm text-muted-foreground">
                Mostrando {products.length} de {totalProducts} productos
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Productos */}
      <Card>
        <CardHeader>
          {/* --- MODIFICACIÓN: Títulos más genéricos --- */}
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>Administra tu inventario y los detalles de los productos.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              {/* Indicador de carga simple */}
              <p>Cargando productos...</p>
              {/* O usar un spinner como tenías: */}
              {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div> */}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Opcional: Añadir columna Imagen si la quieres mostrar */}
                  {/* <TableHead>Imagen</TableHead> */}
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
                      {/* Opcional: Celda para Imagen */}
                      {/* <TableCell>
                        {product.image && (
                          <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded" />
                        )}
                      </TableCell> */}
                      <TableCell className="font-medium">{product.name}</TableCell>
                      {/* --- MODIFICACIÓN: Mostrar 'N/A' o similar si el tipo es null --- */}
                      <TableCell>{product.type ?? 'N/A'}</TableCell>
                      {/* Formatear precio */}
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        {/* DropdownMenu para acciones (sin cambios estructurales) */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            {/* --- MODIFICACIÓN: Pasar el producto completo a openEditDialog --- */}
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {/* --- MODIFICACIÓN: Llamar a handleDeleteProduct con la ID --- */}
                            <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>)}
        </CardContent>

        {/* Controles de paginación */}
        {!isLoading && totalPages > 1 && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {filters.page} de {totalPages} ({totalProducts} productos en total)
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={filters.page <= 1}
                >
                  Anterior
                </Button>

                <div className="flex items-center space-x-1">
                  {/* Mostrar páginas cercanas */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (filters.page <= 3) {
                      pageNum = i + 1
                    } else if (filters.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = filters.page - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={filters.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={filters.page >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Dialog para Editar Producto (sin cambios estructurales grandes aquí) */}
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
        setIsEditDialogOpen(isOpen);
        if (!isOpen) {
          setCurrentProduct(null); // Limpiar producto actual al cerrar
          setFormData(initialFormData); // Limpiar form al cerrar
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Actualiza los detalles de tu producto.</DialogDescription>
          </DialogHeader>

          {/* Formulario de Editar (usa el mismo estado formData, poblado por openEditDialog) */}
          <div className="grid gap-4 py-4">
            {/* Input Nombre */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Nombre</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
            </div>            {/* Input Tipo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">Tipo</Label>
              <Select
                value={formData.type || "sin-tipo"}
                onValueChange={(value) => setFormData({ ...formData, type: value === "sin-tipo" ? "" : value })}
              >
                <SelectTrigger className="col-span-3">
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

            {/* Input Precio */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">Precio</Label>
              <Input id="edit-price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} className="col-span-3" />
            </div>

            {/* Input Stock */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-stock" className="text-right">Stock</Label>
              <Input id="edit-stock" name="stock" type="number" step="1" min="0" value={formData.stock} onChange={handleInputChange} className="col-span-3" />
            </div>            {/* Input URL de imagen */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">URL imagen</Label>
              <Input id="edit-image" name="image" value={formData.image} onChange={handleInputChange} className="col-span-3" placeholder="URL de la imagen del producto" />
            </div>

            {/* Input Descripción */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Descripción</Label>
              <Textarea id="edit-description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" />
            </div>

            {/* Opcional: Input Imagen */}
            {/* <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-image" className="text-right">URL Imagen</Label>
                 <Input id="edit-image" name="image" value={formData.image} onChange={handleInputChange} className="col-span-3" />
               </div> */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setCurrentProduct(null); setFormData(initialFormData); }}>Cancelar</Button>
            <Button onClick={handleEditProduct}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}