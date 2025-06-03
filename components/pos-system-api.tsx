"use client"

import { useEffect, useState } from "react"
import { Beer, Minus, Plus, Receipt, Search, ShoppingCart, Trash, UserIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface CartItem {
    product: Product
    quantity: number
}

interface Customer {
    id: number
    name: string
    email?: string
    phone?: string
    createdAt?: string
    updatedAt?: string
}

interface User {
    id: number
    name: string
    email: string
    role: string
    createdAt?: string
    updatedAt?: string
}

export function PosSystem() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [cart, setCart] = useState<CartItem[]>([])
    const [activeTab, setActiveTab] = useState("all")
    const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState("")
    const [customers, setCustomers] = useState<Customer[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState("")

    // URL del API de productos
    const API_URL = "http://localhost:8000/api/v1/products"

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Obtener productos desde la API
                console.log("Obteniendo productos desde:", API_URL);
                const productsResponse = await fetch(API_URL);

                if (!productsResponse.ok) {
                    throw new Error(`Error HTTP al obtener productos: ${productsResponse.status}`);
                }

                const productsData = await productsResponse.json(); console.log("Datos de productos obtenidos:", productsData);
                setProducts(productsData);

                // Obtener clientes desde el backend
                console.log("Cargando clientes desde:", "http://localhost:8000/api/v1/customers");
                const customersResponse = await fetch("http://localhost:8000/api/v1/customers");

                if (!customersResponse.ok) {
                    throw new Error(`Error HTTP al obtener clientes: ${customersResponse.status}`);
                } const customersData = await customersResponse.json();
                console.log("Datos de clientes obtenidos:", customersData);
                setCustomers(customersData);

                // Obtener usuarios desde el backend
                console.log("Cargando usuarios desde:", "http://localhost:8000/api/v1/users");
                const usersResponse = await fetch("http://localhost:8000/api/v1/users");

                if (!usersResponse.ok) {
                    throw new Error(`Error HTTP al obtener usuarios: ${usersResponse.status}`);
                }

                const usersData = await usersResponse.json();
                console.log("Datos de usuarios obtenidos:", usersData);
                setUsers(usersData);
                // Seleccionar el primer usuario por defecto
                if (usersData.length > 0) {
                    setSelectedUser(usersData[0].id.toString());
                }

            } catch (error) {
                console.error("Error al obtener datos:", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los productos desde la API.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast({
                title: "Error",
                description: "Este producto no está disponible",
                variant: "destructive",
            })
            return
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id)

            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    toast({
                        title: "Error",
                        description: "No puede añadir más del stock disponible",
                        variant: "destructive",
                    })
                    return prevCart
                }

                return prevCart.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
                )
            } else {
                return [...prevCart, { product, quantity: 1 }]
            }
        })
    }

    const decreaseQuantity = (productId: number) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === productId)

            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
            } else {
                return prevCart.filter((item) => item.product.id !== productId)
            }
        })
    }

    const removeFromCart = (productId: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
    }

    const clearCart = () => {
        setCart([])
        setSelectedCustomer("")
    }

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
    }

    const handleCheckout = async () => {
        try {
            if (!selectedUser) {
                toast({
                    title: "Error",
                    description: "Por favor selecciona un usuario",
                    variant: "destructive",
                })
                return
            }

            const amount = Number.parseFloat(paymentAmount)

            if (isNaN(amount)) {
                toast({
                    title: "Error",
                    description: "Por favor ingresa un monto válido",
                    variant: "destructive",
                })
                return
            }

            const total = getCartTotal()

            if (amount < total) {
                toast({
                    title: "Error",
                    description: "El monto de pago es menor que el total",
                    variant: "destructive",
                })
                return
            }            // Preparar datos para la venta
            const change = amount - total;
            const saleData = {
                items: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                total,
                paymentAmount: amount,
                change: change,
                paymentMethod: "Efectivo", // Default payment method
                customerId: selectedCustomer ? parseInt(selectedCustomer) : undefined,
                userId: parseInt(selectedUser)
            };

            console.log("Enviando datos de venta:", saleData);// Crear la venta en el backend
            const response = await fetch('http://localhost:8000/api/v1/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData)
            })

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error HTTP ${response.status}:`, errorText);
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
            }

            const saleResponse = await response.json()
            console.log("Venta creada exitosamente:", saleResponse)

            // Actualizar el stock de productos
            const updatedProducts = products.map((product) => {
                const cartItem = cart.find((item) => item.product.id === product.id)
                if (cartItem) {
                    return {
                        ...product,
                        stock: product.stock - cartItem.quantity,
                    }
                }
                return product
            })

            setProducts(updatedProducts)
            setCart([])
            setIsCheckoutDialogOpen(false)
            setPaymentAmount("")
            setSelectedCustomer("")

            const customerName = selectedCustomer
                ? customers.find((c) => c.id.toString() === selectedCustomer)?.name || "Desconocido"
                : "Cliente de paso"

            toast({
                title: "Éxito",
                description: `Venta completada para ${customerName}. Cambio: $${(amount - total).toFixed(2)}`,
            })
        } catch (error) {
            console.error("Error al procesar la venta:", error)
            toast({
                title: "Error",
                description: "No se pudo procesar la venta",
                variant: "destructive",
            })
        }
    }

    const getProductsByType = () => {
        let filtered = products

        // Aplicar filtro de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (product.type && product.type.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        // Aplicar filtro de tipo
        if (activeTab !== "all") {
            filtered = filtered.filter((product) =>
                product.type && product.type.toLowerCase() === activeTab.toLowerCase()
            )
        }

        return filtered
    }

    const getUniqueTypes = () => {
        const types = products
            .map((product) => product.type)
            .filter((type): type is string => type !== null);

        return ["all", ...new Set(types)]
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Punto de venta</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Selección de cerveza</CardTitle>
                            <CardDescription>Selecciona una cerveza para añadir a la orden</CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar cervezas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <>
                                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                                        <TabsList className="w-full flex flex-wrap justify-start overflow-auto">
                                            {getUniqueTypes().map((type) => (
                                                <TabsTrigger
                                                    key={type}
                                                    value={type}
                                                    className="flex-grow md:flex-grow-0"
                                                >
                                                    {type === "all" ? "Todos" : type}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </Tabs>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {getProductsByType().length === 0 ? (
                                            <p className="col-span-full text-center text-muted-foreground py-8">
                                                No se encontraron productos
                                            </p>
                                        ) : (
                                            getProductsByType().map((product) => (
                                                <Card key={product.id} className="overflow-hidden">
                                                    <CardHeader className="p-4 pb-2">
                                                        <div className="flex justify-between">
                                                            <CardTitle className="text-base">{product.name}</CardTitle>
                                                            <span className={product.stock <= 10 ? "text-red-500" : "text-green-500"}>
                                                                {product.stock} uds
                                                            </span>
                                                        </div>
                                                        <CardDescription className="text-xs">{product.type}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-0">
                                                        <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                                                    </CardContent>
                                                    <CardFooter className="p-2 bg-muted/50">
                                                        <Button
                                                            onClick={() => addToCart(product)}
                                                            disabled={product.stock <= 0}
                                                            className="w-full flex items-center"
                                                            size="sm"
                                                        >
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Añadir orden
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="sticky top-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Orden actual
                                </CardTitle>
                                {cart.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={clearCart}>
                                        <Trash className="h-4 w-4 mr-1" />
                                        Limpiar
                                    </Button>
                                )}
                            </div>
                            <CardDescription>No hay artículo en la orden</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <Beer className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Añadir alguna cerveza para iniciar</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {cart.map((item) => (
                                        <div key={item.product.id} className="flex justify-between p-4">
                                            <div className="flex-1 pr-4">
                                                <h4 className="font-medium">{item.product.name}</h4>
                                                <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} x {item.quantity}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => decreaseQuantity(item.product.id)}>
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span>{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        disabled={item.quantity >= item.product.stock}
                                                        onClick={() => addToCart(item.product)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        {cart.length > 0 && (
                            <>
                                <Separator />
                                <CardContent className="p-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Subtotal</span>
                                        <span>${getCartTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span>Total</span>
                                        <span>${getCartTotal().toFixed(2)}</span>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="grid grid-cols-4 items-center gap-2">
                                            <Label htmlFor="customer" className="text-right">
                                                Cliente
                                            </Label>
                                            <Select
                                                value={selectedCustomer}
                                                onValueChange={setSelectedCustomer}
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Cliente de paso" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-2">
                                            <Label htmlFor="user" className="text-right">
                                                Usuario
                                            </Label>
                                            <Select
                                                value={selectedUser}
                                                onValueChange={setSelectedUser}
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select User" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                            {user.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={() => setIsCheckoutDialogOpen(true)}
                                    >
                                        <Receipt className="mr-2 h-4 w-4" />
                                        Checkout
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </Card>
                </div>
            </div>

            <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Finalizar venta</DialogTitle>
                        <DialogDescription>Completa la información para finalizar la venta.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="total" className="text-right">
                                Total
                            </Label>
                            <div className="col-span-3 font-medium">${getCartTotal().toFixed(2)}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="payment" className="text-right">
                                Pago
                            </Label>
                            <Input
                                id="payment"
                                type="number"
                                step="0.01"
                                min={getCartTotal()}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0.00"
                                className="col-span-3"
                            />
                        </div>
                        {paymentAmount && !isNaN(Number(paymentAmount)) && Number(paymentAmount) >= getCartTotal() && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="change" className="text-right">
                                    Cambio
                                </Label>
                                <div className="col-span-3 font-medium">
                                    ${(Number(paymentAmount) - getCartTotal()).toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCheckout}>Completar venta</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
