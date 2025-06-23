"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  UserIcon,
  Mail,
  Shield,
  Calendar,
  Users,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/lib/api-config"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

const getRoleBadgeVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "destructive" as const
    case "manager":
      return "default" as const
    case "bartender":
      return "secondary" as const
    default:
      return "outline" as const
  }
}

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return Shield
    case "manager":
      return UserIcon
    case "bartender":
      return Users
    default:
      return UserIcon
  }
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "bartender",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Fetch users from the backend API
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching users from backend...")

        const response = await fetch(API_ENDPOINTS.users)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Users data received:", data)

        setUsers(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Fallo al cargar los usuarios",
          variant: "destructive",
        })
      }
    }

    fetchUsers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    })
  }

  const handleAddUser = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.role || !formData.password) {
        toast({
          title: "Error",
          description: "Por favor llenar todos los campos requeridos",
          variant: "destructive",
        })
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "El password y la confirmación no coinciden",
          variant: "destructive",
        })
        return
      }

      // Send user to API
      const response = await fetch(API_ENDPOINTS.users, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error creating user: ${response.status}`)
      }

      const newUser = await response.json()
      console.log("User created:", newUser)

      setUsers([...users, newUser])
      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        email: "",
        role: "bartender",
        password: "",
        confirmPassword: "",
      })

      toast({
        title: "Success",
        description: "Usuario añadido correctamente",
      })
    } catch (error) {
      console.error("Failed to add user:", error)
      toast({
        title: "Error",
        description: "Fallo al añadir el usuario",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    if (!currentUser) return

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.role) {
        toast({
          title: "Error",
          description: "Por favor llenar todos los campos requeridos",
          variant: "destructive",
        })
        return
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "El password y la confirmación no coinciden",
          variant: "destructive",
        })
        return
      }

      // Send update to API
      const response = await fetch(`${API_ENDPOINTS.users}/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
        }),
      })

      if (!response.ok) {
        throw new Error(`Error updating user: ${response.status}`)
      }

      const updatedUser = await response.json()
      console.log("User updated:", updatedUser)

      // Update the list with the updated user
      const updatedUsers = users.map((user) => {
        if (user.id === currentUser.id) {
          return updatedUser
        }
        return user
      })

      setUsers(updatedUsers)
      setIsEditDialogOpen(false)
      setCurrentUser(null)

      toast({
        title: "Success",
        description: "Usuario actualizado correctamente",
      })
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: "Error",
        description: "Fallo al actualizar el usuario",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: User) => {
    setCurrentUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    })
    setIsEditDialogOpen(true)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Debug log for filtered results
  console.log("Search term:", searchTerm, "| Filtered users:", filteredUsers.length, "of", users.length)

  // Estadísticas por rol
  const roleStats = users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header - Mejorado para móviles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Usuarios</h1>
          {/* Estadísticas rápidas en móvil */}
          <div className="flex gap-2 mt-2 sm:hidden">
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {filteredUsers.length} usuarios
            </Badge>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Filtrado
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {/* Estadísticas en desktop */}
          <div className="hidden sm:flex gap-2">
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {filteredUsers.length} usuarios
            </Badge>
            {Object.entries(roleStats).map(([role, count]) => {
              const RoleIcon = getRoleIcon(role)
              return (
                <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {count} {role}
                </Badge>
              )
            })}
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Añadir usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Añadir Nuevo Usuario
                </DialogTitle>
                <DialogDescription>Añadir un nuevo usuario al sistema.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre completo"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ingrese el email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Rol
                  </Label>
                  <Select value={formData.role} onValueChange={handleSelectChange}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Manager
                        </div>
                      </SelectItem>
                      <SelectItem value="bartender">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Bartender
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Ingrese la contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirme la contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={handleAddUser} className="w-full sm:w-auto">
                  Añadir Usuario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de usuarios
          </CardTitle>
          <CardDescription>Ver y administrar los usuarios del sistema.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Barra de búsqueda */}
          <div className="p-4 sm:p-0 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios por nombre, email o rol..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden sm:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="hidden md:table-cell">Fecha de creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          {searchTerm
                            ? "No se encontraron usuarios que coincidan con la búsqueda"
                            : "No se encontraron usuarios"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => {
                        const RoleIcon = getRoleIcon(user.role)
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Abrir menú</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Vista de tarjetas para móvil */}
              <div className="sm:hidden space-y-4 p-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No se encontraron usuarios que coincidan con la búsqueda"
                        : "No se encontraron usuarios"}
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role)
                    return (
                      <Card key={user.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  ID: {user.id}
                                </Badge>
                                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs capitalize">
                                  <RoleIcon className="w-3 h-3 mr-1" />
                                  {user.role}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="break-all">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Creado: {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog para editar usuario - Mejorado para móviles */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Usuario
            </DialogTitle>
            <DialogDescription>Actualizar información del usuario.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Nombre
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre completo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ingrese el email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rol
              </Label>
              <Select value={formData.role} onValueChange={handleSelectChange}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Manager
                    </div>
                  </SelectItem>
                  <SelectItem value="bartender">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Bartender
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Dejar en blanco para mantener actual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="edit-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Dejar en blanco para mantener actual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleEditUser} className="w-full sm:w-auto">
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
