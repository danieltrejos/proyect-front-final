"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, Download, Eye, FileText, Search, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface Customer {
    id: number
    name: string
    email?: string
    phone?: string
}

interface User {
    id: number
    name: string
    email: string
    role: string
}

interface Company {
    id: string
    name: string
    registrationNumber: string
    email: string
    phone?: string
}

interface SaleItem {
    id: number
    quantity: number
    price: number
    product: {
        id: number
        name: string
        type?: string
    }
}

interface Invoice {
    id: number
    invoiceNumber: string
    subtotal: number
    taxAmount: number
    taxRate: number
    total: number
    paymentAmount: number
    paymentMethod: string
    change: number
    createdAt: string
    customer?: Customer
    user: User
    company: Company
    saleItems: SaleItem[]
}

interface InvoiceFilters {
    page: number
    limit: number
    invoiceNumber?: string
    customerId?: string
    userId?: string
    startDate?: string
    endDate?: string
}

interface InvoiceResponse {
    invoices: Invoice[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export function InvoicesManagement() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

    // Filtros y paginación
    const [filters, setFilters] = useState<InvoiceFilters>({
        page: 1,
        limit: 10
    })
    const [totalPages, setTotalPages] = useState(0)
    const [totalInvoices, setTotalInvoices] = useState(0)

    const API_BASE_URL = "http://localhost:8000/api/v1"

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        fetchInvoices()
    }, [filters])

    const fetchInitialData = async () => {
        try {
            // Cargar clientes
            const customersResponse = await fetch(`${API_BASE_URL}/customers`)
            if (customersResponse.ok) {
                const customersData = await customersResponse.json()
                setCustomers(customersData)
            }            // Cargar usuarios
            const usersResponse = await fetch(`${API_BASE_URL}/users`)
            if (usersResponse.ok) {
                const usersData = await usersResponse.json()
                setUsers(usersData)
            }
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error)
        }
    }

    const fetchInvoices = async () => {
        try {
            setIsLoading(true)

            // Construir query parameters
            const queryParams = new URLSearchParams()
            queryParams.append('page', filters.page.toString())
            queryParams.append('limit', filters.limit.toString())

            if (filters.invoiceNumber) {
                queryParams.append('invoiceNumber', filters.invoiceNumber)
            }
            if (filters.customerId) {
                queryParams.append('customerId', filters.customerId)
            }
            if (filters.userId) {
                queryParams.append('userId', filters.userId)
            }
            if (filters.startDate) {
                queryParams.append('startDate', filters.startDate)
            }
            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate)
            }

            const url = `${API_BASE_URL}/invoices?${queryParams.toString()}`
            console.log('Fetching invoices from:', url) // Debug log
            console.log('Filters being sent:', filters) // Debug log

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            console.log('Response status:', response.status) // Debug log
            console.log('Response headers:', [...response.headers.entries()]) // Debug log

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Error response text:', errorText) // Debug log
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
            }

            const data: InvoiceResponse = await response.json()
            console.log('Response data:', data) // Debug log

            setInvoices(data.invoices || [])
            setTotalPages(data.totalPages || 0)
            setTotalInvoices(data.total || 0)

        } catch (error) {
            console.error("Error al obtener facturas:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar las facturas",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const downloadInvoice = async (saleId: number, invoiceNumber: string) => {
        try {
            console.log(`Downloading invoice for sale ID: ${saleId}, invoice: ${invoiceNumber}`)

            // Abrir directamente la URL en una nueva ventana para evitar bloqueos
            const downloadUrl = `${API_BASE_URL}/invoices/${saleId}/download`

            // Crear un enlace temporal y hacer clic en él
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = `factura-${invoiceNumber}.pdf`
            link.target = '_blank'
            link.rel = 'noopener noreferrer'

            // Agregar temporalmente al DOM
            document.body.appendChild(link)

            // Hacer clic programáticamente
            link.click()

            // Remover del DOM
            document.body.removeChild(link)

            // Mostrar mensaje de éxito después de un breve delay
            setTimeout(() => {
                toast({
                    title: "Descarga iniciada",
                    description: `Factura ${invoiceNumber} se está descargando`,
                })
            }, 500)

        } catch (error) {
            console.error("Error al descargar factura:", error)

            // Como fallback, intentar abrir en nueva pestaña
            try {
                const fallbackUrl = `${API_BASE_URL}/invoices/${saleId}/download`
                window.open(fallbackUrl, '_blank')

                toast({
                    title: "Descarga alternativa",
                    description: `Se abrió la factura ${invoiceNumber} en una nueva pestaña`,
                })
            } catch (fallbackError) {
                console.error("Error en descarga alternativa:", fallbackError)
                toast({
                    title: "Error",
                    description: "No se pudo descargar la factura. Intenta deshabilitar el bloqueador de anuncios.",
                    variant: "destructive",
                })
            }
        }
    }

    const viewInvoiceDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice)
        setIsDetailDialogOpen(true)
    }

    const handleFilterChange = (key: keyof InvoiceFilters, value: string | number | undefined) => {
        let processedValue = value;

        // Si es "all", convertir a undefined para no enviarlo al backend
        if (value === "all") {
            processedValue = undefined;
        }

        setFilters(prev => ({
            ...prev,
            [key]: processedValue,
            page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1) // Reset page when filters change
        }))
    }

    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 10,
            customerId: undefined,
            userId: undefined,
            invoiceNumber: undefined,
            startDate: undefined,
            endDate: undefined
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Facturas</h1>
                    <p className="text-muted-foreground">
                        Administra y descarga las facturas generadas en el sistema
                    </p>
                </div>
                <Button onClick={fetchInvoices} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualizar
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros de búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="invoiceNumber">Número de Factura</Label>
                            <Input
                                id="invoiceNumber"
                                placeholder="Ej: FAC-00001"
                                value={filters.invoiceNumber || ''}
                                onChange={(e) => handleFilterChange('invoiceNumber', e.target.value)}
                            />
                        </div>                        <div className="space-y-2">
                            <Label htmlFor="customer">Cliente</Label>
                            <Select
                                value={filters.customerId || 'all'}
                                onValueChange={(value) => handleFilterChange('customerId', value === 'all' ? undefined : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los clientes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los clientes</SelectItem>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>                        <div className="space-y-2">
                            <Label htmlFor="user">Usuario</Label>
                            <Select
                                value={filters.userId || 'all'}
                                onValueChange={(value) => handleFilterChange('userId', value === 'all' ? undefined : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los usuarios" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los usuarios</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateRange">Fecha Inicio</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">Fecha Fin</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="limit">Registros por página</Label>
                            <Select
                                value={filters.limit.toString()}
                                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button variant="outline" onClick={clearFilters} className="w-full">
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de facturas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Facturas ({totalInvoices} total)
                    </CardTitle>
                    <CardDescription>
                        Página {filters.page} de {totalPages}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No se encontraron facturas</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>N° Factura</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                        <TableHead>Impuestos</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">
                                                <Badge variant="outline">{invoice.invoiceNumber}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {invoice.customer?.name || 'Cliente de paso'}
                                            </TableCell>
                                            <TableCell>{invoice.user.name}</TableCell>
                                            <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                                            <TableCell>{formatCurrency(invoice.subtotal)}</TableCell>
                                            <TableCell>{formatCurrency(invoice.taxAmount)}</TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(invoice.total)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => viewInvoiceDetails(invoice)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => downloadInvoice(invoice.id, invoice.invoiceNumber)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Paginación */}
                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {Math.min((filters.page - 1) * filters.limit + 1, totalInvoices)} - {Math.min(filters.page * filters.limit, totalInvoices)} de {totalInvoices} facturas
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFilterChange('page', filters.page - 1)}
                                        disabled={filters.page <= 1}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm">
                                        Página {filters.page} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFilterChange('page', filters.page + 1)}
                                        disabled={filters.page >= totalPages}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de detalles de factura */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Detalles de Factura: {selectedInvoice?.invoiceNumber}
                        </DialogTitle>
                        <DialogDescription>
                            Información completa de la factura seleccionada
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6">
                            {/* Información general */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Información de la Empresa</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <Label className="text-sm font-medium">Nombre:</Label>
                                            <p>{selectedInvoice.company.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">NIT:</Label>
                                            <p>{selectedInvoice.company.registrationNumber}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Email:</Label>
                                            <p>{selectedInvoice.company.email}</p>
                                        </div>
                                        {selectedInvoice.company.phone && (
                                            <div>
                                                <Label className="text-sm font-medium">Teléfono:</Label>
                                                <p>{selectedInvoice.company.phone}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Información del Cliente</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <Label className="text-sm font-medium">Nombre:</Label>
                                            <p>{selectedInvoice.customer?.name || 'Cliente de paso'}</p>
                                        </div>
                                        {selectedInvoice.customer?.email && (
                                            <div>
                                                <Label className="text-sm font-medium">Email:</Label>
                                                <p>{selectedInvoice.customer.email}</p>
                                            </div>
                                        )}
                                        {selectedInvoice.customer?.phone && (
                                            <div>
                                                <Label className="text-sm font-medium">Teléfono:</Label>
                                                <p>{selectedInvoice.customer.phone}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Información de la venta */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Información de la Venta</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">Usuario:</Label>
                                            <p>{selectedInvoice.user.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Fecha:</Label>
                                            <p>{formatDate(selectedInvoice.createdAt)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Método de Pago:</Label>
                                            <p>{selectedInvoice.paymentMethod}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Pago Recibido:</Label>
                                            <p>{formatCurrency(selectedInvoice.paymentAmount)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Productos */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Productos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Precio Unit.</TableHead>
                                                <TableHead>Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedInvoice.saleItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.product.name}</TableCell>
                                                    <TableCell>{item.product.type || 'N/A'}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>{formatCurrency(item.price)}</TableCell>
                                                    <TableCell>{formatCurrency(item.quantity * item.price)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Totales */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Resumen de Totales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Impuestos ({selectedInvoice.taxRate}%):</span>
                                            <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>{formatCurrency(selectedInvoice.total)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Pago recibido:</span>
                                            <span>{formatCurrency(selectedInvoice.paymentAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Cambio:</span>
                                            <span>{formatCurrency(selectedInvoice.change)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDetailDialogOpen(false)}
                                >
                                    Cerrar
                                </Button>
                                <Button
                                    onClick={() => downloadInvoice(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
