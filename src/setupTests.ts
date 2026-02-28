import '@testing-library/jest-dom'

// Мок конфига API, чтобы в тестах не использовать import.meta.env
jest.mock('@/api/config', () => ({ API_BASE_URL: 'https://api.test' }))
