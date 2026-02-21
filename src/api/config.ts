/**
 * Базовый URL API (документация: https://github.com/GlebkaF/webdev-hw-api/tree/main/pages/api/fitness).
 * Можно переопределить в .env: VITE_API_BASE_URL=https://your-api.vercel.app/api/fitness
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://webdev-hw-api.herokuapp.com/api/fitness'
