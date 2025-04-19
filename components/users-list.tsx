"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { toast } from "@/components/ui/use-toast"

interface User {
  id: number
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  createdAt: string
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "bartender",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Fetch users from your API
    const fetchUsers = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('http://localhost:8000/api/v1/users')
        // const data = await response.json()

        // For demo purposes, using mock data
        setTimeout(() => {
          const mockUsers: User[] = [
            {
              id: 1,
              name: "Admin User",
              email: "admin@rockbar.com",
              role: "admin",
              status: "active",
              createdAt: "2023-01-01T10:00:00",
            },
            {
              id: 2,
              name: "Bartender 1",
              email: "bartender1@rockbar.com",
              role: "bartender",
              status: "active",
              createdAt: "2023-01-15T14:30:00",
            },
            {
              id: 3,
              name: "Bartender 2",
              email: "bartender2@rockbar.com",
              role: "bartender",
              status: "active",
              createdAt: "2023-02-10T09:15:00",
            },
            {
              id: 4,
              name: "Manager",
              email: "manager@rockbar.com",
              role: "manager",
              status: "active",
              createdAt: "2023-01-05T11:45:00",
            },
            {
              id: 5,
              name: "Former Employee",
              email: "former@rockbar.com",
              role: "bartender",
              status: "inactive",
              createdAt: "2022-11-20T16:30:00",
            },
          ]
          setUsers(mockUsers)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setIsLoading(false)
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
          description: "Please fill all required fields",
          variant: "destructive",
        })
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would send to your API
      // const response = await fetch('http://localhost:8000/api/v1/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     role: formData.role,
      //     password: formData.password
      //   })
      // })
      // const data = await response.json()

      // For demo purposes, simulate adding to the list
      const newUser: User = {
        id: users.length + 1,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: "active",
        createdAt: new Date().toISOString(),
      }

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
        description: "User added successfully",
      })
    } catch (error) {
      console.error("Failed to add user:", error)
      toast({
        title: "Error",
        description: "Failed to add user",
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
          description: "Please fill all required fields",
          variant: "destructive",
        })
        return
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would send to your API
      // const response = await fetch(`http://localhost:8000/api/v1/users/${currentUser.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     role: formData.role,
      //     ...(formData.password ? { password: formData.password } : {})
      //   })
      // })
      // const data = await response.json()

      // For demo purposes, update the list
      const updatedUsers = users.map((user) => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            name: formData.name,
            email: formData.email,
            role: formData.role,
          }
        }
        return user
      })

      setUsers(updatedUsers)
      setIsEditDialogOpen(false)
      setCurrentUser(null)

      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserStatus = async (user: User) => {
    try {
      const newStatus = user.status === "active" ? "inactive" : "active"

      // In a real app, you would send to your API
      // const response = await fetch(`http://localhost:8000/api/v1/users/${user.id}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // })
      // const data = await response.json()

      // For demo purposes, update the list
      const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            status: newStatus as "active" | "inactive",
          }
        }
        return u
      })

      setUsers(updatedUsers)

      toast({
        title: "Success",
        description: `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Failed to toggle user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Add a new user to the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select value={formData.role} onValueChange={handleSelectChange}>
                  <SelectTrigger id="role" className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="bartender">Bartender</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirm
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage system users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-full md:max-w-sm"
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.role}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.status === "active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                {user.status === "active" ? (
                                  <>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Select value={formData.role} onValueChange={handleSelectChange}>
                <SelectTrigger id="edit-role" className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="bartender">Bartender</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                New Password
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-confirmPassword" className="text-right">
                Confirm
              </Label>
              <Input
                id="edit-confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
