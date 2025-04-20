"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

interface Product {
  id: number
  name: string
  type: string
  price: number
  stock: number
  description: string
}

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price: "",
    stock: "",
    description: "",
  })

  useEffect(() => {
    // Fetch products from your API
    const fetchProducts = async () => {
      try {
        // In a real app, you would fetch from your API
        const response = await fetch('http://localhost:8000/api/v1/products')
        const data = await response.json()
        console.log(data)
        /* 
        setProducts(data)
        setIsLoading(false)
 */

        // For demo purposes, using mock data
        setTimeout(() => {
          const mockProducts: Product[] = [
            {
              id: 1,
              name: "Hoppy IPA",
              type: "IPA",
              price: 7.99,
              stock: 48,
              description: "A hoppy India Pale Ale with citrus notes",
            },
            {
              id: 2,
              name: "Dark Stout",
              type: "Stout",
              price: 8.49,
              stock: 36,
              description: "Rich and creamy stout with coffee undertones",
            },
            {
              id: 3,
              name: "Golden Lager",
              type: "Lager",
              price: 6.99,
              stock: 72,
              description: "Crisp and refreshing traditional lager",
            },
            {
              id: 4,
              name: "Amber Ale",
              type: "Ale",
              price: 7.49,
              stock: 54,
              description: "Medium-bodied amber ale with caramel notes",
            },
            {
              id: 5,
              name: "Wheat Beer",
              type: "Wheat",
              price: 7.29,
              stock: 42,
              description: "Light and refreshing wheat beer with citrus hints",
            },
            {
              id: 6,
              name: "Belgian Tripel",
              type: "Belgian",
              price: 9.99,
              stock: 24,
              description: "Strong Belgian-style tripel with fruity esters",
            },
            {
              id: 7,
              name: "Sour Cherry",
              type: "Sour",
              price: 8.99,
              stock: 18,
              description: "Tart and fruity sour beer with cherry flavor",
            },
            {
              id: 8,
              name: "Porter",
              type: "Porter",
              price: 7.99,
              stock: 30,
              description: "Robust porter with chocolate and toffee notes",
            },
          ]
          setProducts(mockProducts)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch products:", error)
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleAddProduct = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.type || !formData.price || !formData.stock) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would send to your API
      // const response = await fetch('http://localhost:8000/api/v1/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     type: formData.type,
      //     price: parseFloat(formData.price),
      //     stock: parseInt(formData.stock),
      //     description: formData.description
      //   })
      // })
      // const data = await response.json()

      // For demo purposes, simulate adding to the list
      const newProduct: Product = {
        id: products.length + 1,
        name: formData.name,
        type: formData.type,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        description: formData.description,
      }

      setProducts([...products, newProduct])
      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        type: "",
        price: "",
        stock: "",
        description: "",
      })

      toast({
        title: "Success",
        description: "Product added successfully",
      })
    } catch (error) {
      console.error("Failed to add product:", error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async () => {
    if (!currentProduct) return

    try {
      // Validate form data
      if (!formData.name || !formData.type || !formData.price || !formData.stock) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would send to your API
      // const response = await fetch(`http://localhost:8000/api/v1/products/${currentProduct.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     type: formData.type,
      //     price: parseFloat(formData.price),
      //     stock: parseInt(formData.stock),
      //     description: formData.description
      //   })
      // })
      // const data = await response.json()

      // For demo purposes, update the list
      const updatedProducts = products.map((product) => {
        if (product.id === currentProduct.id) {
          return {
            ...product,
            name: formData.name,
            type: formData.type,
            price: Number.parseFloat(formData.price),
            stock: Number.parseInt(formData.stock),
            description: formData.description,
          }
        }
        return product
      })

      setProducts(updatedProducts)
      setIsEditDialogOpen(false)
      setCurrentProduct(null)

      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    } catch (error) {
      console.error("Failed to update product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      // In a real app, you would send to your API
      // await fetch(`http://localhost:8000/api/v1/products/${id}`, {
      //   method: 'DELETE'
      // })

      // For demo purposes, update the list
      const updatedProducts = products.filter((product) => product.id !== id)
      setProducts(updatedProducts)

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      type: product.type,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agrega un nuevo producto</DialogTitle>
              <DialogDescription>Añade un nuevo producto de cerveza a tu inventario.</DialogDescription>
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <Input
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProduct}>Agregar producto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos de cerveza</CardTitle>
          <CardDescription>Administre su inventario de cerveza y los detalles del producto.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
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
                      Productos no encontrados
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.type}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
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
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar productos</DialogTitle>
            <DialogDescription>Actualice los detalles de su producto</DialogDescription>
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Tipo
              </Label>
              <Input
                id="edit-type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Precio
              </Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-stock" className="text-right">
                Stock
              </Label>
              <Input
                id="edit-stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Descripcion
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditProduct}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
