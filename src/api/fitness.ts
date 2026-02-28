import { API_BASE_URL } from '@/api/config'
import { logError, logInfo, logWarn } from '@/utils/logger'

// ключ в localStorage под токен
export const AUTH_TOKEN_STORAGE_KEY = 'skyfitness_auth_token'

export type ApiUserMe = {
  email: string
  selectedCourses: string[]
}

export type ApiCourse = {
  _id: string
  nameRU: string
  nameEN: string
  description: string
  directions: string[]
  fitting: string[]
  workouts: string[]
  difficulty?: string
  durationInDays?: number
  dailyDurationInMinutes?: {
    from: number
    to: number
  }
}

export type ApiWorkoutExercise = {
  _id: string
  name: string
  quantity: number
}

export type ApiWorkout = {
  _id: string
  name: string
  video: string
  exercises: ApiWorkoutExercise[]
}

export type ApiWorkoutProgress = {
  workoutId: string
  workoutCompleted: boolean
  progressData: number[]
}

export type ApiCourseProgress = {
  courseId: string
  courseCompleted: boolean
  workoutsProgress: ApiWorkoutProgress[]
}

export type ApiWorkoutProgressByWorkout = {
  workoutId: string
  workoutCompleted: boolean
  progressData: number[]
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'
const API_TIMEOUT_MS = 45000
const API_RETRY_COUNT = 1 // один повтор при таймауте/сети

function buildHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

// в логах пароль не светим
function sanitizeRequestBody(path: string, body: unknown): unknown {
  if (!body || typeof body !== 'object') return body
  const data = body as Record<string, unknown>
  if (path.includes('/auth/login') || path.includes('/auth/register')) {
    return { ...data, password: '***' }
  }
  return data
}

async function request<T>(
  path: string,
  method: HttpMethod,
  options?: {
    body?: unknown
    token?: string
  },
): Promise<T> {
  let response: Response | null = null
  for (let attempt = 0; attempt <= API_RETRY_COUNT; attempt += 1) {
    const requestUrl = `${API_BASE_URL}${path}`
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS)
    logInfo('API', 'request start', { method, path, attempt, requestUrl })
    if (options?.body !== undefined) {
      logInfo('API', 'request body', {
        method,
        path,
        body: sanitizeRequestBody(path, options.body),
      })
    }

    try {
      response = await fetch(requestUrl, {
        method,
        headers: buildHeaders(options?.token),
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      })
      if (response.ok) {
        logInfo('API', 'request success', {
          method,
          path,
          status: response.status,
          attempt,
        })
      }
      break
    } catch (error) {
      const isAbortError =
        error instanceof DOMException && error.name === 'AbortError'
      const isNetworkError = error instanceof TypeError
      const canRetry = attempt < API_RETRY_COUNT && (isAbortError || isNetworkError)

      if (canRetry) {
        logWarn('API', 'request retry', {
          method,
          path,
          attempt,
          reason: isAbortError ? 'abort' : 'network',
        })
        continue
      }

      if (isAbortError) {
        logError('API', 'request timeout', { method, path, attempt })
        throw new Error(
          'Сервер долго отвечает. Попробуйте еще раз через несколько секунд.',
        )
      }

      logError('API', 'request failed', {
        method,
        path,
        attempt,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  if (!response) {
    throw new Error('Не удалось выполнить запрос к API.')
  }

  let payload: unknown = null
  let rawText = ''
  try {
    rawText = await response.text()
    payload = rawText ? JSON.parse(rawText) : null
  } catch {
    payload = null
  }

  if (path === '/courses' && response.ok) {
    const preview = rawText.length > 200 ? rawText.slice(0, 200) + '...' : rawText
    logInfo('API', 'courses response body', {
      len: rawText.length,
      isArray: Array.isArray(payload),
      preview: preview.slice(0, 120),
    })
  }

  if (!response.ok) {
    let apiMessage: string | null = null
    if (typeof payload === 'object' && payload !== null) {
      const p = payload as Record<string, unknown>
      if (typeof p.message === 'string') apiMessage = p.message
      else if (typeof p.error === 'string') apiMessage = p.error
      else if (typeof p.msg === 'string') apiMessage = p.msg
    }
    if (!apiMessage && typeof rawText === 'string' && rawText.trim().length > 0 && rawText.length < 500) {
      try {
        const parsed = JSON.parse(rawText) as Record<string, unknown>
        if (typeof parsed?.message === 'string') apiMessage = parsed.message
      } catch {
        apiMessage = rawText.trim()
      }
    }
    if (!apiMessage && response.status === 404 && (path.includes('/auth/login') || path.includes('/auth/register'))) {
      apiMessage = path.includes('/auth/register')
        ? 'Пользователь с таким email уже существует или неверные данные.'
        : 'Пользователь не найден или неверный пароль.'
    }

    if (apiMessage) {
      logWarn('API', 'request api-error message', {
        method,
        path,
        status: response.status,
        message: apiMessage,
      })
      throw new Error(apiMessage)
    }

    if (rawText.trim()) {
      logWarn('API', 'request api-error raw', {
        method,
        path,
        status: response.status,
        rawText,
      })
      throw new Error(`Ошибка API ${response.status}: ${rawText.trim()}`)
    }

    throw new Error(
      `Ошибка API ${response.status}. Проверьте VITE_API_BASE_URL и доступность сервера.`,
    )
  }

  if (path.includes('/users/me') || path.includes('/users/me/courses')) {
    logInfo('API', 'response payload', {
      method,
      path,
      payload,
    })
  }

  return payload as T
}

export const fitnessApi = {
  register: (email: string, password: string) =>
    request<{ message: string }>('/auth/register', 'POST', {
      body: { email, password },
    }),

  login: (email: string, password: string) =>
    request<{ token: string }>('/auth/login', 'POST', {
      body: { email, password },
    }),

  me: (token: string) => request<ApiUserMe>('/users/me', 'GET', { token }),

  getCourses: async (): Promise<ApiCourse[]> => {
    const data = await request<ApiCourse[] | null>('/courses', 'GET')
    return Array.isArray(data) ? data : []
  },

  getCourseById: (courseId: string) =>
    request<ApiCourse>(`/courses/${courseId}`, 'GET'),

  getCourseWorkouts: (courseId: string, token: string) =>
    request<ApiWorkout[]>(`/courses/${courseId}/workouts`, 'GET', { token }),

  addCourseToUser: (courseId: string, token: string) =>
    request<{ message: string }>('/users/me/courses', 'POST', {
      token,
      body: { courseId },
    }),

  deleteCourseFromUser: (courseId: string, token: string) =>
    request<{ message: string }>(`/users/me/courses/${courseId}`, 'DELETE', {
      token,
    }),

  resetCourseProgress: (courseId: string, token: string) =>
    request<{ message: string }>(`/courses/${courseId}/reset`, 'PATCH', {
      token,
    }),

  getWorkoutById: (workoutId: string, token: string) =>
    request<ApiWorkout>(`/workouts/${workoutId}`, 'GET', { token }),

  getCourseProgress: (courseId: string, token: string) =>
    request<ApiCourseProgress>(
      `/users/me/progress?courseId=${encodeURIComponent(courseId)}`,
      'GET',
      { token },
    ),

  getWorkoutProgress: (courseId: string, workoutId: string, token: string) =>
    request<ApiWorkoutProgressByWorkout>(
      `/users/me/progress?courseId=${encodeURIComponent(courseId)}&workoutId=${encodeURIComponent(workoutId)}`,
      'GET',
      { token },
    ),

  saveWorkoutProgress: (
    courseId: string,
    workoutId: string,
    progressData: number[],
    token: string,
  ) =>
    request<unknown>(
      `/courses/${courseId}/workouts/${workoutId}`,
      'PATCH',
      {
        token,
        body: { progressData },
      },
    ),

  resetWorkoutProgress: (courseId: string, workoutId: string, token: string) =>
    request<{ message: string }>(
      `/courses/${courseId}/workouts/${workoutId}/reset`,
      'PATCH',
      { token },
    ),
}

