/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { AUTH_TOKEN_STORAGE_KEY, fitnessApi } from '@/api/fitness'
import type { AuthContextValue, User } from '@/common/types'

// ключ под которым данные пользователя лежат в localStorage браузера
const STORAGE_KEY = 'skyfitness_user'

// из значения email пытаемся сделать удобную структуру для интерфейса
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

// аккуратно приводим неизвестное значение к объекту с полями
function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) return null
  return value as Record<string, unknown>
}

// обходим вложенные объекты по типичным ключам ответа API
// и собираем все найденные "слои" в один список
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

// из произвольного ответа API вытаскиваем первый найденный email
function extractApiEmail(payload: unknown): string {
  const records = collectNestedRecords(payload)
  for (const record of records) {
    if (typeof record.email === 'string') return record.email
  }
  return ''
}

// из ответа API достаём id выбранных пользователем курсов
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

// пробуем найти выбранные курсы сначала по полю selectedCourses, потом по courses
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

export type { User } from '@/common/types'

// сам контекст авторизации, сюда кладём информацию о пользователе и методы
const AuthContext = createContext<AuthContextValue | null>(null)

// читаем пользователя из localStorage, если он там сохранён
function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

// сохраняем или удаляем пользователя в localStorage
function saveUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY)
}

// читаем токен авторизации из localStorage
function loadToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

// сохраняем или удаляем токен авторизации
function saveToken(token: string | null) {
  if (token) localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

// провайдер авторизации оборачивает всё приложение и даёт доступ к данным пользователя
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)
  const [token, setToken] = useState<string | null>(loadToken)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  // при каждом обновлении user синхронизируем значение с localStorage
  useEffect(() => {
    saveUser(user)
  }, [user])

  // при каждом обновлении токена синхронизируем его с localStorage
  useEffect(() => {
    saveToken(token)
  }, [token])

  // логин: сохраняем пользователя и токен и закрываем модальное окно
  const login = useCallback((u: User, authToken: string) => {
    setUser(u)
    setToken(authToken)
    setLoginModalOpen(false)
  }, [])

  // логаут: очищаем пользователя и токен
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
  }, [])

  // пробуем получить актуальную информацию о текущем пользователе с бэкенда
  const refreshMe = useCallback(async () => {
    const activeToken = loadToken()
    if (!activeToken) return
    try {
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
    } catch (error) {
      throw error
    }
  }, [])

  // при первой загрузке приложения проверяем есть ли в localStorage токен
  // и если есть, подтягиваем данные пользователя
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
      })
      .catch(() => {})
  }, [])

  // управление видимостью модального окна авторизации
  const openLoginModal = useCallback(() => setLoginModalOpen(true), [])
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), [])

  // объект со всеми данными и методами, которые будут доступны через хук useAuth
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
