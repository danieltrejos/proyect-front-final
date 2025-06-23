"use client"

import { useEffect, useState } from "react"
import {
    Download,
    Eye,
    FileText,
    Filter,
    RefreshCw,
    Building,
    UserIcon,
    DollarSign,
    Clock,
    Receipt,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/lib/api-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

interface Customer {
    id: number
    name: string
    email?: string
    phone?: string
}

interface InvoiceUser {
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
    user: InvoiceUser
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
    const [users, setUsers] = useState<InvoiceUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    // Filtros y paginación
    const [filters, setFilters] = useState<InvoiceFilters>({
        page: 1,
        limit: 10,
    })
    const [totalPages, setTotalPages] = useState(0)
    const [totalInvoices, setTotalInvoices] = useState(0)

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        fetchInvoices()
    }, [filters])

    const fetchInitialData = async () => {
        try {
            // Cargar clientes
            const customersResponse = await fetch(API_ENDPOINTS.customers)
            if (customersResponse.ok) {
                const customersData = await customersResponse.json()
                setCustomers(customersData)
            }

            // Cargar usuarios
            const usersResponse = await fetch(API_ENDPOINTS.users)
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
            queryParams.append("page", filters.page.toString())
            queryParams.append("limit", filters.limit.toString())

            if (filters.invoiceNumber) {
                queryParams.append("invoiceNumber", filters.invoiceNumber)
            }
            if (filters.customerId) {
                queryParams.append("customerId", filters.customerId)
            }
            if (filters.userId) {
                queryParams.append("userId", filters.userId)
            }
            if (filters.startDate) {
                queryParams.append("startDate", filters.startDate)
            }
            if (filters.endDate) {
                queryParams.append("endDate", filters.endDate)
            }

            const url = `${API_ENDPOINTS.invoices}?${queryParams.toString()}`
            console.log("Fetching invoices from:", url) // Debug log
            console.log("Filters being sent:", filters) // Debug log

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            console.log("Response status:", response.status) // Debug log
            console.log("Response headers:", [...response.headers.entries()]) // Debug log

            if (!response.ok) {
                const errorText = await response.text()
                console.error("Error response text:", errorText) // Debug log
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
            }

            const data: InvoiceResponse = await response.json()
            console.log("Response data:", data) // Debug log

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
            const downloadUrl = `${API_ENDPOINTS.invoices}/${saleId}/download`

            // Crear un enlace temporal y hacer clic en él
            const link = document.createElement("a")
            link.href = downloadUrl
            link.download = `factura-${invoiceNumber}.pdf`
            link.target = "_blank"
            link.rel = "noopener noreferrer"

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
                const fallbackUrl = `${API_ENDPOINTS.invoices}/${saleId}/download`
                window.open(fallbackUrl, "_blank")

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

    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 10,
            customerId: undefined,
            userId: undefined,
            invoiceNumber: undefined,
            startDate: undefined,
            endDate: undefined,
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`
    }

    // Calcular estadísticas
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0)

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Header - Mejorado para móviles */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Facturas</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Administra y descarga las facturas generadas en el sistema
                    </p>
                    {/* Estadísticas rápidas en móvil */}
                    <div className="flex gap-2 mt-2 sm:hidden">
                        <Badge variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {totalInvoices} facturas
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {formatCurrency(totalAmount)}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    {/* Estadísticas en desktop */}
                    <div className="hidden sm:flex gap-2">
                        <Badge variant="outline">
                            <FileText className="w-3 h-3 mr-1" />
                            {totalInvoices} facturas
                        </Badge>
                        <Badge variant="secondary">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {formatCurrency(totalAmount)}
                        </Badge>
                    </div>
                    <Button onClick={fetchInvoices} disabled={isLoading} className="w-full sm:w-auto">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Filtros colapsibles */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros de búsqueda
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            {showFilters ? "Ocultar" : "Mostrar"}
                        </Button>
                    </div>
                </CardHeader>
                <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            {/* Filtro de búsqueda rápida */}
                            <div className="space-y-2">
                                <Label htmlFor="invoiceNumber">Número de Factura</Label>
                                <Input
                                    id="invoiceNumber"
                                    placeholder="Ej: FAC-00001"
                                    value={filters.invoiceNumber || ""}
                                    onChange={(e) => handleFilterChange("invoiceNumber", e.target.value)}
                                />
                            </div>

                            {/* Filtros por persona */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">Filtros por persona</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer">Cliente</Label>
                                        <Select
                                            value={filters.customerId || "all"}
                                            onValueChange={(value) => handleFilterChange("customerId", value === "all" ? undefined : value)}
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="user">Usuario</Label>
                                        <Select
                                            value={filters.userId || "all"}
                                            onValueChange={(value) => handleFilterChange("userId", value === "all" ? undefined : value)}
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
                                </div>
                            </div>

                            {/* Filtros de fecha */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">Rango de fechas</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Fecha Inicio</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={filters.startDate || ""}
                                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">Fecha Fin</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={filters.endDate || ""}
                                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Configuración y acciones */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div className="space-y-2">
                                    <Label htmlFor="limit">Registros por página</Label>
                                    <Select
                                        value={filters.limit.toString()}
                                        onValueChange={(value) => handleFilterChange("limit", Number.parseInt(value))}
                                    >
                                        <SelectTrigger className="w-full sm:w-32">
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

                                <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                                    <X className="mr-2 h-4 w-4" />
                                    Limpiar Filtros
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
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
                <CardContent className="p-0 sm:p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No se encontraron facturas</p>
                        </div>
                    ) : (
                        <>
                            {/* Vista de tabla para desktop */}
                            <div className="hidden lg:block">
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
                                                <TableCell>{invoice.customer?.name || "Cliente de paso"}</TableCell>
                                                <TableCell>{invoice.user.name}</TableCell>
                                                <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                                                <TableCell>{formatCurrency(invoice.subtotal)}</TableCell>
                                                <TableCell>{formatCurrency(invoice.taxAmount)}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => viewInvoiceDetails(invoice)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" onClick={() => downloadInvoice(invoice.id, invoice.invoiceNumber)}>
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Vista de tarjetas para móvil y tablet */}
                            <div className="lg:hidden space-y-4 p-4">
                                {invoices.map((invoice) => (
                                    <Card key={invoice.id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{invoice.invoiceNumber}</Badge>
                                                    <Badge variant="secondary">{formatCurrency(invoice.total)}</Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground text-right">
                                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                                    <br />
                                                    {new Date(invoice.createdAt).toLocaleTimeString()}
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Cliente:</span>
                                                    <span>{invoice.customer?.name || "Cliente de paso"}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Usuario:</span>
                                                    <span>{invoice.user.name}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Pago:</span>
                                                    <span>{invoice.paymentMethod}</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs">
                                                    <div>
                                                        <span className="text-muted-foreground">Subtotal:</span>
                                                        <div className="font-medium">{formatCurrency(invoice.subtotal)}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Impuestos:</span>
                                                        <div className="font-medium">{formatCurrency(invoice.taxAmount)}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => viewInvoiceDetails(invoice)}
                                                    className="flex-1"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Ver
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => downloadInvoice(invoice.id, invoice.invoiceNumber)}
                                                    className="flex-1"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    PDF
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Paginación - Mejorada para móviles */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t mx-4 sm:mx-0">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Mostrando {Math.min((filters.page - 1) * filters.limit + 1, totalInvoices)} -{" "}
                                    {Math.min(filters.page * filters.limit, totalInvoices)} de {totalInvoices} facturas
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFilterChange("page", filters.page - 1)}
                                        disabled={filters.page <= 1}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm px-2">
                                        Página {filters.page} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFilterChange("page", filters.page + 1)}
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

            {/* Dialog de detalles de factura - Mejorado para móviles */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Detalles: {selectedInvoice?.invoiceNumber}
                        </DialogTitle>
                        <DialogDescription>Información completa de la factura seleccionada</DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Información general - Reorganizada para móvil */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Información de la Empresa
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Nombre:</Label>
                                            <p className="font-medium">{selectedInvoice.company.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">NIT:</Label>
                                            <p>{selectedInvoice.company.registrationNumber}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Email:</Label>
                                            <p className="break-all">{selectedInvoice.company.email}</p>
                                        </div>
                                        {selectedInvoice.company.phone && (
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">Teléfono:</Label>
                                                <p>{selectedInvoice.company.phone}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                            <UserIcon className="h-4 w-4" />
                                            Información del Cliente
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Nombre:</Label>
                                            <p className="font-medium">{selectedInvoice.customer?.name || "Cliente de paso"}</p>
                                        </div>
                                        {selectedInvoice.customer?.email && (
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">Email:</Label>
                                                <p className="break-all">{selectedInvoice.customer.email}</p>
                                            </div>
                                        )}
                                        {selectedInvoice.customer?.phone && (
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">Teléfono:</Label>
                                                <p>{selectedInvoice.customer.phone}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Información de la venta */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Información de la Venta
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Usuario:</Label>
                                            <p className="font-medium">{selectedInvoice.user.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Fecha:</Label>
                                            <p>{formatDate(selectedInvoice.createdAt)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Método de Pago:</Label>
                                            <p>{selectedInvoice.paymentMethod}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Pago Recibido:</Label>
                                            <p className="font-medium">{formatCurrency(selectedInvoice.paymentAmount)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Productos - Vista responsiva */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                        <Receipt className="h-4 w-4" />
                                        Productos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Vista de tabla para desktop */}
                                    <div className="hidden sm:block">
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
                                                        <TableCell>{item.product.type || "N/A"}</TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>{formatCurrency(item.price)}</TableCell>
                                                        <TableCell>{formatCurrency(item.quantity * item.price)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Vista de lista para móvil */}
                                    <div className="sm:hidden space-y-3">
                                        {selectedInvoice.saleItems.map((item) => (
                                            <div key={item.id} className="bg-muted/50 p-3 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.product.type || "N/A"}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-muted-foreground">Cantidad:</span>
                                                        <div className="font-medium">{item.quantity}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Precio:</span>
                                                        <div className="font-medium">{formatCurrency(item.price)}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Total:</span>
                                                        <div className="font-medium">{formatCurrency(item.quantity * item.price)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Totales */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Resumen de Totales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Impuestos ({selectedInvoice.taxRate}%):</span>
                                            <span className="font-medium">{formatCurrency(selectedInvoice.taxAmount)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-bold text-base">
                                            <span>Total:</span>
                                            <span>{formatCurrency(selectedInvoice.total)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Pago recibido:</span>
                                            <span className="font-medium">{formatCurrency(selectedInvoice.paymentAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Cambio:</span>
                                            <span className="font-medium">{formatCurrency(selectedInvoice.change)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2">
                                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} className="w-full sm:w-auto">
                                    Cerrar
                                </Button>
                                <Button
                                    onClick={() => downloadInvoice(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                                    className="w-full sm:w-auto"
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
