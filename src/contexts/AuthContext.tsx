import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'skyfitness_user'

export type User = {
  name: string
  login: string
  email?: string
  avatarUrl?: string
}

type AuthContextValue = {
  user: User | null
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  loginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function saveUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  useEffect(() => {
    saveUser(user)
  }, [user])

  const login = useCallback((u: User) => {
    setUser(u)
    setLoginModalOpen(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const openLoginModal = useCallback(() => setLoginModalOpen(true), [])
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), [])

  const value: AuthContextValue = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
    loginModalOpen,
    openLoginModal,
    closeLoginModal,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
