// модуль, который отвечает за все запросы к API бэкенда
import axios, { type AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/api/config'
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

// максимальное время ожидания ответа сервера в миллисекундах
const API_TIMEOUT_MS = 45000

// пробуем вытащить человеко-понятное сообщение об ошибке из ответа API
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

// общий экземпляр axios с базовым адресом и таймаутом
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
})

// перехватчик запросов: здесь сбрасываем старый заголовок Content-Type
// и всегда отправляем данные как текст, чтобы сервер не путался
client.interceptors.request.use((cfg) => {
  if (cfg.headers && cfg.data !== undefined) {
    delete cfg.headers['Content-Type']
    delete cfg.headers['content-type']
    cfg.headers['Content-Type'] = 'text/plain; charset=utf-8'
  }
  return cfg
})

// универсальная функция-обёртка над axios
// принимает метод, путь и опции и возвращает данные ожидаемого типа T
async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  config?: { body?: unknown; token?: string }
): Promise<T> {
  const token = config?.token
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const axiosConfig: AxiosRequestConfig = {
      method,
      url: path,
      headers: Object.keys(headers).length ? headers : undefined,
      data:
        config?.body !== undefined ? JSON.stringify(config.body) : undefined,
    }

    const res = await client.request<T>(axiosConfig)
    return res.data as T
  } catch (err) {
    const isTimeout = axios.isAxiosError(err) && err.code === 'ECONNABORTED'

    if (axios.isAxiosError(err) && err.response) {
      const apiMessage = getApiMessage(
        { data: err.response.data, status: err.response.status },
        path
      )
      if (apiMessage) throw new Error(apiMessage)
      const rawText =
        typeof err.response.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response.data)
      if (rawText.trim()) {
        throw new Error(`Ошибка API ${err.response.status}: ${rawText.trim()}`)
      }
      throw new Error(
        `Ошибка API ${err.response.status}. Проверьте VITE_API_BASE_URL и доступность сервера.`
      )
    }

    if (isTimeout) {
      throw new Error(
        'Сервер долго отвечает. Попробуйте еще раз через несколько секунд.'
      )
    }

    throw new Error('Не удалось выполнить запрос к API.')
  }
}

// объект с конкретными методами API, которые использует приложение
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
