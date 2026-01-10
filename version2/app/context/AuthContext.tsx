"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { login as apiLogin, register as apiRegister, checkHealth, type RegisterData } from "@/lib/api"

// User interface with role support
export interface User {
  email: string
  role: "requester" | "provider" | "admin"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isConnected: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, role: "requester" | "provider") => Promise<void>
  logout: () => void
  checkConnection: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const router = useRouter()

  // Check backend connection on mount
  const checkConnection = async (): Promise<boolean> => {
    try {
      await checkHealth()
      setIsConnected(true)
      return true
    } catch {
      setIsConnected(false)
      return false
    }
  }

  useEffect(() => {
    // Check connection and load user from JWT
    const init = async () => {
      await checkConnection()
      
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token) {
        try {
          const decoded: any = jwtDecode(token)
          // Check if token is expired
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token")
            setUser(null)
          } else {
            setUser({
              email: decoded.sub,
              role: decoded.role,
            })
          }
        } catch {
          setUser(null)
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      localStorage.setItem("token", data.access_token)
      const decoded: any = jwtDecode(data.access_token)
      setUser({
        email: decoded.sub,
        role: decoded.role,
      })
      // Redirect based on role
      if (decoded.role === "admin") {
        router.push("/admin")
      } else if (decoded.role === "provider") {
        router.push("/provider")
      } else {
        router.push("/requester")
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, role: "requester" | "provider") => {
    setLoading(true)
    try {
      await apiRegister({ email, password, role })
      router.push("/auth/login?registered=true")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, isConnected, login, register, logout, checkConnection }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
