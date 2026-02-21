import { fitnessApi } from '@/api/fitness'

describe('fitnessApi', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
    global.fetch = originalFetch
  })

  it('sends login request with correct method/body', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'jwt-token' }),
    })

    const response = await fitnessApi.login('user@example.com', 'Pass@!1')

    expect(response).toEqual({ token: 'jwt-token' })
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toContain('/auth/login')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({
      email: 'user@example.com',
      password: 'Pass@!1',
    })
  })

  it('adds bearer token for protected endpoints', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ email: 'user@example.com', selectedCourses: [] }),
    })

    await fitnessApi.me('token-123')

    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer token-123')
  })

  it('throws API message on non-2xx response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Неверный пароль' }),
    })

    await expect(fitnessApi.login('user@example.com', 'wrong')).rejects.toThrow(
      'Неверный пароль',
    )
  })
})

