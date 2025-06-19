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
import { toast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"

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
        setIsLoading(true)
        try {
            console.log("Obteniendo productos desde:", API_ENDPOINTS.products)
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

    const sortedProducts = [...products].sort((a, b) => {
        const aValue = sortBy === "name" ? a.name : a.stock
        const bValue = sortBy === "name" ? b.name : b.stock

        if (typeof aValue === "string" && typeof bValue === "string") {
            return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        }

        return 0
    })

    const lowStockProducts = products.filter((product) => product.stock < 5)

    const handleSort = (column: "name" | "stock") => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(column)
            setSortOrder("asc")
        }
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

            // URL completa para debugging
            const restockUrl = `${API_ENDPOINTS.products}/${currentProduct.id}/restock`
            console.log("🚀 Enviando solicitud a:", restockUrl)
            console.log("Con datos:", { amount })

            // Enviar solicitud al API para reabastecer el producto
            const response = await fetch(restockUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount })
            })

            console.log("📈 Status de respuesta:", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("❌ Error desde el API:", errorText)
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            const updatedProduct = await response.json()
            console.log("✅ Producto actualizado:", updatedProduct)

            // Actualizar el estado local
            setProducts(products.map(p => p.id === currentProduct.id ? updatedProduct : p))
            setIsRestockDialogOpen(false)
            setCurrentProduct(null)
            setRestockAmount("")

            toast({
                title: "Stock actualizado",
                description: `Stock de ${currentProduct.name} actualizado correctamente`,
            })
        } catch (error) {
            console.error("Failed to restock product:", error)
            toast({
                title: "Error",
                description: "No se pudo actualizar el stock del producto",
                variant: "destructive",
            })
        }
    }

    const openRestockDialog = (product: Product) => {
        setCurrentProduct(product)
        setRestockAmount("")
        setIsRestockDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
                    <p className="text-muted-foreground">Administra el stock de tus productos</p>
                </div>
                <Button onClick={fetchProducts} disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                </Button>
            </div>

            {lowStockProducts.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="text-orange-800">Productos con stock bajo</CardTitle>
                        <CardDescription className="text-orange-600">
                            Los siguientes productos tienen menos de 5 unidades en stock
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {lowStockProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between">
                                    <span className="font-medium text-orange-800">{product.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-orange-600">Stock: {product.stock}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openRestockDialog(product)}
                                        >
                                            Reabastecer
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Inventario</CardTitle>
                    <CardDescription>Lista completa de productos y sus niveles de stock</CardDescription>
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
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort("name")}
                                            className="h-auto p-0 font-semibold"
                                        >
                                            Producto
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort("stock")}
                                            className="h-auto p-0 font-semibold"
                                        >
                                            Stock
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.type}</TableCell>
                                        <TableCell>${product.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`font-medium ${product.stock < 5
                                                        ? "text-red-600"
                                                        : product.stock < 10
                                                            ? "text-orange-600"
                                                            : "text-green-600"
                                                    }`}
                                            >
                                                {product.stock}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openRestockDialog(product)}
                                            >
                                                Reabastecer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reabastecer Producto</DialogTitle>
                        <DialogDescription>
                            {currentProduct && `Agregar stock para ${currentProduct.name}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                Stock Actual
                            </Label>
                            <div className="col-span-3 font-medium">
                                {currentProduct?.stock || 0} unidades
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Cantidad a agregar
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                value={restockAmount}
                                onChange={(e) => setRestockAmount(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        {restockAmount && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Nuevo Stock</Label>
                                <div className="col-span-3 font-medium text-green-600">
                                    {(currentProduct?.stock || 0) + Number.parseInt(restockAmount || "0")} unidades
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleRestock}>Reabastecer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
