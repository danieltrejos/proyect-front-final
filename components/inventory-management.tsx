"use client"

import { useEffect, useState } from "react"
import { ArrowUpDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { toast } from "@/components/ui/use-toast"

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
    // Fetch products from your API
    const fetchProducts = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('http://localhost:8000/api/v1/products')
        // const data = await response.json()

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
              stock: 12,
              description: "Light and refreshing wheat beer with citrus hints",
            },
            {
              id: 6,
              name: "Belgian Tripel",
              type: "Belgian",
              price: 9.99,
              stock: 8,
              description: "Strong Belgian-style tripel with fruity esters",
            },
            {
              id: 7,
              name: "Sour Cherry",
              type: "Sour",
              price: 8.99,
              stock: 5,
              description: "Tart and fruity sour beer with cherry flavor",
            },
            {
              id: 8,
              name: "Porter",
              type: "Porter",
              price: 7.99,
              stock: 18,
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
          description: "Please enter a valid amount",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would send to your API
      // const response = await fetch(`http://localhost:8000/api/v1/products/${currentProduct.id}/restock`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount })
      // })
      // const data = await response.json()

      // For demo purposes, update the list
      const updatedProducts = products.map((product) => {
        if (product.id === currentProduct.id) {
          return {
            ...product,
            stock: product.stock + amount,
          }
        }
        return product
      })

      setProducts(updatedProducts)
      setIsRestockDialogOpen(false)
      setCurrentProduct(null)

      toast({
        title: "Success",
        description: `Restocked ${amount} units of ${currentProduct.name}`,
      })
    } catch (error) {
      console.error("Failed to restock product:", error)
      toast({
        title: "Error",
        description: "Failed to restock product",
        variant: "destructive",
      })
    }
  }

  const getLowStockStatus = (stock: number) => {
    if (stock <= 10) return "bg-red-500/10 text-red-500"
    if (stock <= 20) return "bg-yellow-500/10 text-yellow-500"
    return ""
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de inventario</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario de Cervezas</CardTitle>
          <CardDescription>Monitore y gestione el nivel de cervezas.</CardDescription>
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
                        <span className={`px-2 py-1 rounded-md ${getLowStockStatus(product.stock)}`}>
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reabastecer Productos</DialogTitle>
            <DialogDescription>
              {currentProduct && `Agregar mas unidades de ${currentProduct.name} a tu inventario.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restock-amount" className="text-right">
                Cantidad para adicionar
              </Label>
              <Input
                id="restock-amount"
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
            {currentProduct && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Stock actual</Label>
                <div className="col-span-3">{currentProduct.stock} unidades</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRestock}>Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
