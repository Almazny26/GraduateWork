// откуда ходим в API; в .env можно поставить VITE_API_BASE_URL чтобы в dev шло через прокси
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://webdev-hw-api.herokuapp.com/api/fitness'

// в консоли видно какой URL юзаем (для отладки)
if (typeof window !== 'undefined') {
  console.log('[SkyFitnessPro] API_BASE_URL =', API_BASE_URL, import.meta.env.VITE_API_BASE_URL ? '(из .env)' : '(fallback Heroku)')
}
