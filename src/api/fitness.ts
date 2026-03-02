import axios, { type AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/api/config'
import { logError, logInfo, logWarn } from '@/utils/logger'
import type {
  ApiCourse,
  ApiCourseProgress,
  ApiUserMe,
  ApiWorkout,
  ApiWorkoutProgressByWorkout,
} from '@/api/types'

export { AUTH_TOKEN_STORAGE_KEY } from '@/api/authStorage'
export type {
  ApiCourse,
  ApiUserMe,
  ApiWorkout,
  ApiWorkoutProgress,
} from '@/api/types'

const API_TIMEOUT_MS = 45000

// пароль в логах не выводим, чтобы не светить
function sanitizeBody(path: string, body: unknown): unknown {
  if (!body || typeof body !== 'object') return body
  const data = body as Record<string, unknown>
  if (path.includes('/auth/login') || path.includes('/auth/register')) {
    return { ...data, password: '***' }
  }
  return data
}

function getApiMessage(response: { data?: unknown; status: number }, path: string): string | null {
  const data = response.data
  if (typeof data === 'object' && data !== null) {
    const p = data as Record<string, unknown>
    if (typeof p.message === 'string') return p.message
    if (typeof p.error === 'string') return p.error
    if (typeof p.msg === 'string') return p.msg
  }
  if (response.status === 404 && (path.includes('/auth/login') || path.includes('/auth/register'))) {
    return path.includes('/auth/register')
      ? 'Пользователь с таким email уже существует или неверные данные.'
      : 'Пользователь не найден или неверный пароль.'
  }
  return null
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
})

// API не принимает application/json — для запросов с телом шлём text/plain и JSON-строку
client.interceptors.request.use((cfg) => {
  if (cfg.headers && cfg.data !== undefined) {
    delete cfg.headers['Content-Type']
    delete cfg.headers['content-type']
    cfg.headers['Content-Type'] = 'text/plain; charset=utf-8'
  }
  return cfg
})

// один повтор при таймауте или сетевой ошибке
async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  config?: { body?: unknown; token?: string }
): Promise<T> {
  const url = path.startsWith('http') ? path : path
  const token = config?.token
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      logInfo('API', 'request start', { method, path, attempt })
      if (config?.body !== undefined) {
        logInfo('API', 'request body', {
          method,
          path,
          body: sanitizeBody(path, config.body),
        })
      }

      // тело всегда строкой (JSON), Content-Type ставит интерцептор в text/plain
      const axiosConfig: AxiosRequestConfig = {
        method,
        url,
        headers: Object.keys(headers).length ? headers : undefined,
        data:
          config?.body !== undefined ? JSON.stringify(config.body) : undefined,
      }

      const res = await client.request<T>(axiosConfig)

      logInfo('API', 'request success', {
        method,
        path,
        status: res.status,
        attempt,
      })

      if (path.includes('/users/me') || path.includes('/users/me/courses')) {
        logInfo('API', 'response payload', { method, path, payload: res.data })
      }

      if (path === '/courses' && res.data != null) {
        const raw = JSON.stringify(res.data)
        const preview = raw.length > 200 ? raw.slice(0, 200) + '...' : raw
        logInfo('API', 'courses response body', {
          len: raw.length,
          isArray: Array.isArray(res.data),
          preview: preview.slice(0, 120),
        })
      }

      return res.data as T
    } catch (err) {
      const isTimeout = axios.isAxiosError(err) && err.code === 'ECONNABORTED'
      const isNetwork = axios.isAxiosError(err) && !err.response
      const canRetry = attempt === 0 && (isTimeout || isNetwork)

      if (canRetry) {
        logWarn('API', 'request retry', {
          method,
          path,
          attempt,
          reason: isTimeout ? 'abort' : 'network',
        })
        continue
      }

      if (axios.isAxiosError(err) && err.response) {
        const apiMessage = getApiMessage(
          { data: err.response.data, status: err.response.status },
          path
        )
        if (apiMessage) {
          logWarn('API', 'request api-error message', {
            method,
            path,
            status: err.response.status,
            message: apiMessage,
          })
          throw new Error(apiMessage)
        }
        const rawText =
          typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data)
        if (rawText.trim()) {
          logWarn('API', 'request api-error raw', {
            method,
            path,
            status: err.response.status,
            rawText,
          })
          throw new Error(`Ошибка API ${err.response.status}: ${rawText.trim()}`)
        }
        throw new Error(
          `Ошибка API ${err.response.status}. Проверьте VITE_API_BASE_URL и доступность сервера.`
        )
      }

      if (isTimeout) {
        logError('API', 'request timeout', { method, path, attempt })
        throw new Error(
          'Сервер долго отвечает. Попробуйте еще раз через несколько секунд.'
        )
      }

      logError('API', 'request failed', {
        method,
        path,
        attempt,
        error: err instanceof Error ? err.message : String(err),
      })
      throw err
    }
  }

  throw new Error('Не удалось выполнить запрос к API.')
}

export const fitnessApi = {
  register: (email: string, password: string) =>
    request<{ message: string }>('POST', '/auth/register', {
      body: { email, password },
    }),

  login: (email: string, password: string) =>
    request<{ token: string }>('POST', '/auth/login', {
      body: { email, password },
    }),

  me: (token: string) => request<ApiUserMe>('GET', '/users/me', { token }),

  getCourses: async (): Promise<ApiCourse[]> => {
    const data = await request<ApiCourse[] | null>('GET', '/courses')
    return Array.isArray(data) ? data : []
  },

  getCourseById: (courseId: string) =>
    request<ApiCourse>('GET', `/courses/${courseId}`),

  getCourseWorkouts: (courseId: string, token: string) =>
    request<ApiWorkout[]>('GET', `/courses/${courseId}/workouts`, { token }),

  addCourseToUser: (courseId: string, token: string) =>
    request<{ message: string }>('POST', '/users/me/courses', {
      token,
      body: { courseId },
    }),

  deleteCourseFromUser: (courseId: string, token: string) =>
    request<{ message: string }>('DELETE', `/users/me/courses/${courseId}`, {
      token,
    }),

  resetCourseProgress: (courseId: string, token: string) =>
    request<{ message: string }>('PATCH', `/courses/${courseId}/reset`, {
      token,
    }),

  getWorkoutById: (workoutId: string, token: string) =>
    request<ApiWorkout>('GET', `/workouts/${workoutId}`, { token }),

  getCourseProgress: (courseId: string, token: string) =>
    request<ApiCourseProgress>(
      'GET',
      `/users/me/progress?courseId=${encodeURIComponent(courseId)}`,
      { token }
    ),

  getWorkoutProgress: (courseId: string, workoutId: string, token: string) =>
    request<ApiWorkoutProgressByWorkout>(
      'GET',
      `/users/me/progress?courseId=${encodeURIComponent(courseId)}&workoutId=${encodeURIComponent(workoutId)}`,
      { token }
    ),

  saveWorkoutProgress: (
    courseId: string,
    workoutId: string,
    progressData: number[],
    token: string
  ) =>
    request<unknown>('PATCH', `/courses/${courseId}/workouts/${workoutId}`, {
      token,
      body: { progressData },
    }),

  resetWorkoutProgress: (courseId: string, workoutId: string, token: string) =>
    request<{ message: string }>(
      'PATCH',
      `/courses/${courseId}/workouts/${workoutId}/reset`,
      { token }
    ),
}
