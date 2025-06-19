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
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_ENDPOINTS } from "@/lib/api-config"

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
  email: string
  phone: string
}

interface User {
  id: number
  name: string
  role: string
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

  useEffect(() => {
    // Fetch products, customers, and users from your API
    const fetchData = async () => {
      try {
        // Fetch products from API
        setIsLoading(true);
        console.log("Fetching products from:", API_ENDPOINTS.products);
        const productsResponse = await fetch(API_ENDPOINTS.products);

        if (!productsResponse.ok) {
          throw new Error(`HTTP Error fetching products: ${productsResponse.status}`);
        }

        const productsData = await productsResponse.json();
        console.log("Products data obtained:", productsData);
        setProducts(productsData);

        // Mock data for customers and users - replace with API calls when available
        const mockCustomers: Customer[] = [
          {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "555-123-4567",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "555-987-6543",
          },
          {
            id: 3,
            name: "Robert Johnson",
            email: "robert.johnson@example.com",
            phone: "555-456-7890",
          },
          {
            id: 4,
            name: "Maria Rodriguez",
            email: "maria.rodriguez@example.com",
            phone: "555-789-0123",
          },
          {
            id: 5,
            name: "David Wilson",
            email: "david.wilson@example.com",
            phone: "555-234-5678",
          },
        ];

        const mockUsers: User[] = [
          {
            id: 1,
            name: "SuperAdmin",
            role: "admin",
          },
          {
            id: 2,
            name: "Bartender 1",
            role: "bartender",
          },
          {
            id: 3,
            name: "Bartender 2",
            role: "bartender",
          },
        ];

        setCustomers(mockCustomers);
        setUsers(mockUsers);
        setSelectedUser(mockUsers[0].id.toString()); // Default to first user
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
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
          description: "El monto del pago es menor al total",
          variant: "destructive",
        })
        return
      }

      // Send sale to API
      const response = await fetch(API_ENDPOINTS.sales, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          total,
          payment: amount,
          customerId: selectedCustomer || null,
          userId: selectedUser
        })
      });

      if (!response.ok) {
        throw new Error(`Error creating sale: ${response.status}`);
      }

      const data = await response.json();
      console.log("Sale created:", data);

      // Update product stock locally for immediate UI feedback
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
        ? customers.find((c) => c.id.toString() === selectedCustomer)?.name || "Unknown"
        : "Walk-in customer"

      toast({
        title: "Success",
        description: `Sale completed for ${customerName}. Change: $${(amount - total).toFixed(2)}`,
      })
    } catch (error) {
      console.error("Failed to process sale:", error)
      toast({
        title: "Error",
        description: "Failed to process sale",
        variant: "destructive",
      })
    }
  }

  const getProductsByType = () => {
    let filtered = products

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.type && product.type.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply type filter
    if (activeTab !== "all") {
      filtered = filtered.filter((product) => product.type && product.type.toLowerCase() === activeTab.toLowerCase())
    }

    return filtered
  }
  const getUniqueTypes = () => {
    const types = products.map((product) => product.type).filter((type): type is string => Boolean(type))
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
              <CardTitle>Selección de productos</CardTitle>
              <CardDescription>Selecciona un producto para añadir a la orden</CardDescription>
              <div className="flex flex-col gap-4 mt-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar productos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
                    {isLoading ? (
                      <TabsTrigger value="all">All</TabsTrigger>
                    ) : (
                      getUniqueTypes().map((type) => (
                        <TabsTrigger key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </TabsTrigger>
                      ))
                    )}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {getProductsByType().map((product) => (
                    <Card key={product.id} className={product.stock <= 0 ? "opacity-50" : ""}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>{product.type}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex justify-between items-center">
                          <p className="font-bold">${product.price.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full" onClick={() => addToCart(product)} disabled={product.stock <= 0}>
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir orden
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Orden actual
              </CardTitle>
              <CardDescription>
                {cart.length === 0 ? "No items en la orden" : `${cart.length} items en la orden`}
              </CardDescription>
              <div className="grid gap-2 mt-2">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="customer" className="text-right text-sm">
                    Clientes
                  </Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger id="customer" className="col-span-3">
                      <SelectValue placeholder="Walk-in customer" />
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
                  <Label htmlFor="user" className="text-right text-sm">
                    Usuarios
                  </Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger id="user" className="col-span-3">
                      <SelectValue placeholder="Select user" />
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
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Beer className="h-12 w-12 mb-2" />
                  <p>Añadir algún producto para iniciar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => decreaseQuantity(item.product.id)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => addToCart(item.product)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}>
                          <Trash className="h-4 w-4" />
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
                <CardContent className="pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline" onClick={clearCart}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                  <Button onClick={() => setIsCheckoutDialogOpen(true)}>
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
            <DialogTitle>Complete Sale</DialogTitle>
            <DialogDescription>Finalize the customer's order and process payment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Order Summary</h3>
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity} x {item.product.name}
                  </span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer-info" className="text-right">
                  Customer
                </Label>
                <div id="customer-info" className="col-span-3">
                  {selectedCustomer ? (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>
                        {customers.find((c) => c.id.toString() === selectedCustomer)?.name || "Unknown customer"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Cliente de la calle</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-amount" className="text-right">
                  Payment
                </Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="col-span-3"
                />
              </div>
              {Number.parseFloat(paymentAmount) > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Change</Label>
                  <div className="col-span-3 font-medium">
                    ${Math.max(0, Number.parseFloat(paymentAmount) - getCartTotal()).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout}>Complete Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
