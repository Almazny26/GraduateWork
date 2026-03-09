import '@testing-library/jest-dom'

jest.mock('@/api/config', () => ({ API_BASE_URL: 'https://api.test' }))
