"use client"

import { useState, useEffect } from "react"
import { Building2, Upload, Save, MapPin, Mail, Phone, Globe, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/lib/api-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

interface Company {
    id: string
    name: string
    registrationNumber: string
    email: string
    phone?: string
    currency: string
    timezone: string
    logo?: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    createdAt: string
    updatedAt: string
}

interface CompanyFormData {
    name: string
    registrationNumber: string
    email: string
    phone: string
    currency: string
    timezone: string
    logo: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
}

export function CompanyConfiguration() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [company, setCompany] = useState<Company | null>(null)
    const [formData, setFormData] = useState<CompanyFormData>({
        name: "",
        registrationNumber: "",
        email: "",
        phone: "",
        currency: "COP",
        timezone: "America/Bogota",
        logo: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Colombia"
    })

    // Opciones para selects
    const currencyOptions = [
        { value: "COP", label: "Peso Colombiano (COP)" },
        { value: "USD", label: "Dólar Estadounidense (USD)" },
        { value: "EUR", label: "Euro (EUR)" },
        { value: "MXN", label: "Peso Mexicano (MXN)" },
        { value: "ARS", label: "Peso Argentino (ARS)" }
    ]

    const timezoneOptions = [
        { value: "America/Bogota", label: "Colombia (GMT-5)" },
        { value: "America/New_York", label: "Nueva York (GMT-5/-4)" },
        { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
        { value: "America/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
        { value: "Europe/Madrid", label: "Madrid (GMT+1/+2)" }
    ]

    const countryOptions = [
        { value: "Colombia", label: "Colombia" },
        { value: "Estados Unidos", label: "Estados Unidos" },
        { value: "México", label: "México" },
        { value: "Argentina", label: "Argentina" },
        { value: "España", label: "España" }
    ]

    // Cargar datos de la empresa
    useEffect(() => {
        fetchCompanyData()
    }, [])

    const fetchCompanyData = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_ENDPOINTS.companies}/main`)

            if (response.ok) {
                const companyData = await response.json()
                setCompany(companyData)
                setFormData({
                    name: companyData.name || "",
                    registrationNumber: companyData.registrationNumber || "",
                    email: companyData.email || "",
                    phone: companyData.phone || "",
                    currency: companyData.currency || "COP",
                    timezone: companyData.timezone || "America/Bogota",
                    logo: companyData.logo || "",
                    street: companyData.street || "",
                    city: companyData.city || "",
                    state: companyData.state || "",
                    postalCode: companyData.postalCode || "",
                    country: companyData.country || "Colombia"
                })
            } else {
                // Si no hay empresa principal, mostrar formulario vacío para crear una nueva
                console.log("No se encontró empresa principal")
            }
        } catch (error) {
            console.error("Error al cargar datos de la empresa:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos de la empresa",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSelectChange = (field: keyof CompanyFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            const url = company
                ? `${API_ENDPOINTS.companies}/${company.id}`
                : API_ENDPOINTS.companies

            const method = company ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const updatedCompany = await response.json()
                setCompany(updatedCompany)

                toast({
                    title: "Éxito",
                    description: company
                        ? "Configuración de empresa actualizada correctamente"
                        : "Empresa creada correctamente"
                })
            } else {
                const error = await response.json()
                throw new Error(error.message || 'Error al guardar')
            }
        } catch (error) {
            console.error("Error al guardar:", error)
            toast({
                title: "Error",
                description: "No se pudieron guardar los cambios",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Perfil de la empresa</h1>
                    <p className="text-muted-foreground">
                        Configura la información básica de tu empresa
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar datos
                        </>
                    )}
                </Button>
            </div>

            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                    <TabsTrigger value="address">Dirección</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Logo y información básica */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Información básica
                                </CardTitle>
                                <CardDescription>
                                    Datos principales de la empresa
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Logo */}
                                <div className="space-y-2">
                                    <Label>Logo de la empresa</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.logo || company?.logo ? (
                                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                                <Image
                                                    src={formData.logo || company?.logo || "/placeholder-logo.png"}
                                                    alt="Logo de la empresa"
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                                <Building2 className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <Button variant="outline" size="sm">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Subir logo
                                        </Button>
                                    </div>
                                    <Input
                                        name="logo"
                                        value={formData.logo}
                                        onChange={handleInputChange}
                                        placeholder="URL del logo (opcional)"
                                        className="text-sm"
                                    />
                                </div>

                                {/* Nombre */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre de la empresa *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Brewsy"
                                        required
                                    />
                                </div>

                                {/* Número de registro */}
                                <div className="space-y-2">
                                    <Label htmlFor="registrationNumber">Número de registro *</Label>
                                    <Input
                                        id="registrationNumber"
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 900123456-7"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información de contacto */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Información de contacto
                                </CardTitle>
                                <CardDescription>
                                    Datos de contacto de la empresa
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo electrónico *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="contacto@brewsy.com"
                                        required
                                    />
                                </div>

                                {/* Teléfono */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+57 5 2825555"
                                    />
                                </div>

                                {/* Moneda */}
                                <div className="space-y-2">
                                    <Label>Moneda</Label>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(value) => handleSelectChange("currency", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencyOptions.map((currency) => (
                                                <SelectItem key={currency.value} value={currency.value}>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4" />
                                                        {currency.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Zona horaria */}
                                <div className="space-y-2">
                                    <Label>Zona horaria</Label>
                                    <Select
                                        value={formData.timezone}
                                        onValueChange={(value) => handleSelectChange("timezone", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timezoneOptions.map((timezone) => (
                                                <SelectItem key={timezone.value} value={timezone.value}>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        {timezone.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="address" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Dirección de la empresa
                            </CardTitle>
                            <CardDescription>
                                Ubicación física de la empresa
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Calle */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="street">Calle/Dirección *</Label>
                                    <Input
                                        id="street"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        placeholder="Calle 25 # 15-45, Centro"
                                        required
                                    />
                                </div>

                                {/* Ciudad */}
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ciudad *</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Sincelejo"
                                        required
                                    />
                                </div>

                                {/* Estado/Región */}
                                <div className="space-y-2">
                                    <Label htmlFor="state">Región/Provincia *</Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="Sucre"
                                        required
                                    />
                                </div>

                                {/* Código postal */}
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Código Postal *</Label>
                                    <Input
                                        id="postalCode"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="700001"
                                        required
                                    />
                                </div>

                                {/* País */}
                                <div className="space-y-2">
                                    <Label>País *</Label>
                                    <Select
                                        value={formData.country}
                                        onValueChange={(value) => handleSelectChange("country", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryOptions.map((country) => (
                                                <SelectItem key={country.value} value={country.value}>
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4" />
                                                        {country.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
