// откуда ходим в API; в .env можно поставить VITE_API_BASE_URL чтобы в dev шло через прокси
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://webdev-hw-api.herokuapp.com/api/fitness'
