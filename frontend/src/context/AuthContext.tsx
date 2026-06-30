import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../api/client'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: {
    name: string
    email: string
    phone?: string
    password: string
    role?: string
  }) => Promise<void>
  logout: () => void
  isAuthority: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('roadwatch_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const me = await api.me()
      setUser(me)
    } catch {
      localStorage.removeItem('roadwatch_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await api.login(email, password)
    localStorage.setItem('roadwatch_token', access_token)
    const me = await api.me()
    setUser(me)
  }, [])

  const signup = useCallback(
    async (data: {
      name: string
      email: string
      phone?: string
      password: string
      role?: string
    }) => {
      await api.signup(data)
      await login(data.email, data.password)
    },
    [login],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('roadwatch_token')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      isAuthority: user?.role === 'authority' || user?.role === 'admin',
    }),
    [user, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
