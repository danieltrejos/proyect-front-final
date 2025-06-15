"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Beer, ClipboardList, Home, LayoutDashboard, Menu, Package, ShoppingCart, Users, X, User, Settings, LogOut, ChevronDown, Building2, DollarSign, Calculator, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [configurationOpen, setConfigurationOpen] = useState(false)
  const routes = [
    {
      href: "/overview",
      label: "Vista General",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/products",
      label: "Productos",
      icon: <Beer className="h-5 w-5" />,
    },
    {
      href: "/inventory",
      label: "Inventario",
      icon: <Package className="h-5 w-5" />,
    },
    {
      href: "/pos",
      label: "Punto de venta",
      icon: <ShoppingCart className="h-5 w-5" />,
    },

    {
      href: "/sales-history",
      label: "Historial de ventas",
      icon: <ClipboardList className="h-5 w-5" />,
    },

    {
      href: "/invoices",
      label: "Facturas",
      icon: <FileText className="h-5 w-5" />,
    },

    {
      href: "/customers",
      label: "Clientes",
      icon: <Users className="h-5 w-5" />,
    },

    {
      href: "/customer-orders",
      label: "Pedidos de clientes",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      href: "/users",
      label: "Usuarios",
      icon: <Users className="h-5 w-5" />,
    },
  ]

  // Configuración submenu
  const configurationRoutes = [
    {
      href: "/configuration/company",
      label: "Perfil de la empresa",
      icon: <Building2 className="h-4 w-4" />,
    }, {
      href: "/configuration/currencies",
      label: "Monedas",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      href: "/configuration/taxes",
      label: "Impuestos",
      icon: <Calculator className="h-4 w-4" />,
    },
  ]
  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6" />
                <h2 className="text-lg font-bold">Brewsy</h2>
              </div>

            </div>            <nav className="flex-1 p-4 space-y-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname === route.href ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    }`}
                >
                  {route.icon}
                  {route.label}
                </Link>
              ))}

              {/* Configuración Dropdown - Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setConfigurationOpen(!configurationOpen)}
                  className={`flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent/50 ${pathname.startsWith('/configuration') ? "bg-accent text-accent-foreground" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    Configuración
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${configurationOpen ? "rotate-180" : ""}`} />
                </button>

                {configurationOpen && (
                  <div className="ml-6 space-y-1">                    {configurationRoutes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname === route.href
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                        }`}
                    >
                      {route.icon}
                      {route.label}
                    </Link>
                  ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-6 border-b">
            {/* <LayoutDashboard className="h-6 w-6" /> */}
            <Image
              src="/logo_oficial.png"
              alt="Metropolitan Logo"
              width={64}
              height={64}
              className="hidden lg:block w-14 h-14 rounded-full"
            />
            <h2 className="text-2xl font-bold">Brewsy</h2>
          </div>          <nav className="flex-1 p-4 space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname === route.href ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  }`}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}

            {/* Configuración Dropdown - Desktop */}
            <div className="space-y-1">
              <button
                onClick={() => setConfigurationOpen(!configurationOpen)}
                className={`flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent/50 ${pathname.startsWith('/configuration') ? "bg-accent text-accent-foreground" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  Configuración
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${configurationOpen ? "rotate-180" : ""}`} />
              </button>

              {configurationOpen && (
                <div className="ml-6 space-y-1">                  {configurationRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname === route.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                      }`}
                  >
                    {route.icon}
                    {route.label}
                  </Link>
                ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>

            {/* Spacer to push profile button to the right */}
            <div className="flex-1" />

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Admin@brewsy.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="http://localhost:3000/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>

        {/* Footer */}
        <footer className="py-8 px-4 md:px-6 bg-black text-white mt-auto">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Logo y descripción */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Image
                    src="/logo_oficial.png"
                    alt="Brewsy Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-xl font-bold text-white">Brewsy</span>
                </div>
                <p className="text-gray-400 text-sm">
                  La solución SaaS para la gestión inteligente de inventarios de bebidas.
                </p>
              </div>

              {/* Producto */}
              <div>
                <h3 className="font-semibold text-white mb-4">Producto</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link href="/#" className="hover:text-white transition-colors">
                      Características
                    </Link>
                  </li>
                  <li>
                    <Link href="/#" className="hover:text-white transition-colors">
                      Precios
                    </Link>
                  </li>
                  <li>
                    <Link href="/#" className="hover:text-white transition-colors">
                      Demo
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Soporte */}
              <div>
                <h3 className="font-semibold text-white mb-4">Soporte</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Centro de ayuda
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Documentación
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Manual de usuario
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contacto */}
              <div>
                <h3 className="font-semibold text-white mb-4">Contacto</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>soporte@brewsy.com</li>
                  <li>+57 3016651643</li>
                  <li>www.brewsy.com</li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2025 Brewsy. Todos los derechos reservados. Daniel Trejos - Armando Ledezma - José Ensuncho</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
