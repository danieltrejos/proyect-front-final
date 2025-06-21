"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  user: { name: string; email: string; role: string } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const savedAuth = localStorage.getItem('brewsy_auth')
    const savedUser = localStorage.getItem('brewsy_user')
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Credenciales hardcodeadas
    if (email === 'admin@brewsy.com' && password === 'admin') {
      const userData = {
        name: 'Administrador',
        email: 'admin@brewsy.com',
        role: 'admin'
      }
      
      setIsAuthenticated(true)
      setUser(userData)
      localStorage.setItem('brewsy_auth', 'true')
      localStorage.setItem('brewsy_user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('brewsy_auth')
    localStorage.removeItem('brewsy_user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
