/* eslint-disable react-refresh/only-export-components -- export useAuth hook and User type */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { AUTH_TOKEN_STORAGE_KEY, fitnessApi } from '@/api/fitness'
import { logError, logInfo, logWarn } from '@/utils/logger'

const STORAGE_KEY = 'skyfitness_user'

// из ответа API достаём email и делаем логин из части до @
function parseAuthIdentity(email: unknown) {
  if (typeof email !== 'string') {
    return { email: '', login: 'user' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    return { email: '', login: 'user' }
  }

  const loginFromEmail = normalizedEmail.split('@')[0] || 'user'
  return { email: normalizedEmail, login: loginFromEmail }
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) return null
  return value as Record<string, unknown>
}

// рекурсивно ищем объекты в ответе (user, data, result и т.д.)
function collectNestedRecords(root: unknown): Record<string, unknown>[] {
  const first = toRecord(root)
  if (!first) return []

  const keysToDive = ['user', 'data', 'result', 'payload']
  const queue: Record<string, unknown>[] = [first]
  const result: Record<string, unknown>[] = []
  const seen = new Set<Record<string, unknown>>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || seen.has(current)) continue
    seen.add(current)
    result.push(current)

    keysToDive.forEach((key) => {
      const nested = toRecord(current[key])
      if (nested) queue.push(nested)
    })
  }

  return result
}

// email может быть вложен в разные поля ответа
function extractApiEmail(payload: unknown): string {
  const records = collectNestedRecords(payload)
  for (const record of records) {
    if (typeof record.email === 'string') return record.email
  }
  return ''
}

// selectedCourses с бэка привожу к массиву id
function normalizeSelectedCourseIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []

  const ids = raw
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (typeof item !== 'object' || item === null) return ''

      const record = item as Record<string, unknown>
      const candidate =
        (typeof record._id === 'string' && record._id) ||
        (typeof record.courseId === 'string' && record.courseId) ||
        (typeof record.id === 'string' && record.id) ||
        ''

      return candidate.trim()
    })
    .filter(Boolean)

  return Array.from(new Set(ids))
}

function extractSelectedCourses(payload: unknown): string[] {
  const records = collectNestedRecords(payload)
  for (const record of records) {
    const fromSelectedCourses = normalizeSelectedCourseIds(
      record.selectedCourses
    )
    if (fromSelectedCourses.length > 0) return fromSelectedCourses
  }

  for (const record of records) {
    const fromCourses = normalizeSelectedCourseIds(record.courses)
    if (fromCourses.length > 0) return fromCourses
  }

  return []
}

export type User = {
  name: string
  login: string
  email: string
  selectedCourses: string[]
  avatarUrl?: string
}

type AuthContextValue = {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  login: (user: User, token: string) => void
  logout: () => void
  refreshMe: () => Promise<void>
  loginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// при загрузке страницы читаю юзера из localStorage
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

function loadToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function saveToken(token: string | null) {
  if (token) localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)
  const [token, setToken] = useState<string | null>(loadToken)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  useEffect(() => {
    saveUser(user)
  }, [user])

  useEffect(() => {
    saveToken(token)
  }, [token])

  const login = useCallback((u: User, authToken: string) => {
    logInfo('AuthContext', 'login success', {
      email: u.email,
      selectedCourses: u.selectedCourses.length,
    })
    setUser(u)
    setToken(authToken)
    setLoginModalOpen(false)
  }, [])

  const logout = useCallback(() => {
    logInfo('AuthContext', 'logout')
    setUser(null)
    setToken(null)
  }, [])

  const refreshMe = useCallback(async () => {
    const activeToken = loadToken()
    if (!activeToken) return
    try {
      logInfo('AuthContext', 'refreshMe started')
      const me = await fitnessApi.me(activeToken)
      const identity = parseAuthIdentity(extractApiEmail(me))
      const selectedCourses = extractSelectedCourses(me)
      setUser({
        name: identity.login,
        login: identity.login,
        email: identity.email,
        selectedCourses,
      })
      setToken(activeToken)
      logInfo('AuthContext', 'refreshMe success', {
        email: identity.email,
        selectedCourses: selectedCourses.length,
      })
    } catch (error) {
      logError('AuthContext', 'refreshMe failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }, [])

  // при первом заходе если есть токен - подтягиваю данные юзера с API
  useEffect(() => {
    const activeToken = loadToken()
    if (!activeToken) return
    fitnessApi
      .me(activeToken)
      .then((me) => {
        const identity = parseAuthIdentity(extractApiEmail(me))
        const selectedCourses = extractSelectedCourses(me)
        setUser({
          name: identity.login,
          login: identity.login,
          email: identity.email,
          selectedCourses,
        })
        setToken(activeToken)
        logInfo('AuthContext', 'bootstrap me success', {
          email: identity.email,
          selectedCourses: selectedCourses.length,
        })
      })
      .catch(() => {
        // если API недоступен при загрузке - не выкидываю из сессии, оставляю что в localStorage
        logWarn('AuthContext', 'bootstrap me failed, keep local session')
      })
  }, [])

  const openLoginModal = useCallback(() => setLoginModalOpen(true), [])
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), [])

  const value: AuthContextValue = {
    user,
    token,
    isLoggedIn: !!user,
    login,
    logout,
    refreshMe,
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
