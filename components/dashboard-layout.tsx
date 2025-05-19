"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Beer, ClipboardList, Home, LayoutDashboard, Menu, Package, ShoppingCart, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    /* {
      href: "/",
      label: "Vista General",
      icon: <Home className="h-5 w-5" />,
    }, */
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
    /*
    {
      href: "/customers",
      label: "Clientes",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/customer-orders",
      label: "Pedidos de clientes",
      icon: <ClipboardList className="h-5 w-5" />,
    }, */
    /* {
      href: "/users",
      label: "Users",
      icon: <Users className="h-5 w-5" />,
    } */,
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="absolute left-4 top-4">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6" />
                <h2 className="text-lg font-bold">Metropolitan</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
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
              className="hidden lg:block w-12 h-12 rounded-full"
            />
            <h2 className="text-lg font-bold">Metropolitan</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
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
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
