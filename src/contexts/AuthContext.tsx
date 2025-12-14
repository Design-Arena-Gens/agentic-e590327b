import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  email: string
  username: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login/', { email, password })
      const { access, user: userData } = response.data
      localStorage.setItem('token', access)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      await axios.post('/api/auth/register/', { username, email, password })
      await login(email, password)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
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
