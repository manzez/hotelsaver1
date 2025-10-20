'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>
}

// Keep the old auth context for backward compatibility if needed
import { useState, createContext, useContext, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function LegacyAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('hotel_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('hotel_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Demo login - in real app, this would be an API call
      if (email === 'demo@hotelsaver.ng' && password === 'demo123') {
        const demoUser = {
          id: 'demo-user',
          email: 'demo@hotelsaver.ng',
          name: 'Demo User'
        }
        setUser(demoUser)
        localStorage.setItem('hotel_user', JSON.stringify(demoUser))
        return true
      }
      
      // Check localStorage for registered users
      const users = JSON.parse(localStorage.getItem('hotel_users') || '[]')
      const foundUser = users.find((u: any) => u.email === email && u.password === password)
      
      if (foundUser) {
        const authUser = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name
        }
        setUser(authUser)
        localStorage.setItem('hotel_user', JSON.stringify(authUser))
        return true
      }
      
      return false
    } catch (error) {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const users = JSON.parse(localStorage.getItem('hotel_users') || '[]')
      
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        return false
      }
      
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name
      }
      
      users.push(newUser)
      localStorage.setItem('hotel_users', JSON.stringify(users))
      
      // Auto login after registration
      const authUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
      setUser(authUser)
      localStorage.setItem('hotel_user', JSON.stringify(authUser))
      
      return true
    } catch (error) {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hotel_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useLegacyAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}