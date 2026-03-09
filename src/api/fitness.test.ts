import { fitnessApi } from '@/api/fitness'

declare global {
  var __axiosRequestMock: jest.Mock | undefined
}

jest.mock('axios', () => {
  const requestMock = jest.fn()
  globalThis.__axiosRequestMock = requestMock
  return {
    __esModule: true,
    default: {
      create: () => ({
        request: requestMock,
        interceptors: {
          request: { use: (fn: (c: unknown) => unknown) => fn },
        },
      }),
      isAxiosError: (e: unknown) =>
        typeof e === 'object' && e !== null && 'isAxiosError' in e,
    },
  }
})

const getMock = () => globalThis.__axiosRequestMock!

describe('fitnessApi', () => {
  beforeEach(() => {
    getMock().mockReset()
  })

  it('sends login request with correct method/body', async () => {
    getMock().mockResolvedValue({
      data: { token: 'jwt-token' },
      status: 200,
    })

    const response = await fitnessApi.login('user@example.com', 'Pass@!1')

    expect(response).toEqual({ token: 'jwt-token' })
    expect(getMock()).toHaveBeenCalledTimes(1)
    const [config] = getMock().mock.calls[0]
    expect(config.url).toContain('/auth/login')
    expect(config.method).toBe('POST')
    expect(JSON.parse(config.data as string)).toEqual({
      email: 'user@example.com',
      password: 'Pass@!1',
    })
  })

  it('adds bearer token for protected endpoints', async () => {
    getMock().mockResolvedValue({
      data: { email: 'user@example.com', selectedCourses: [] },
      status: 200,
    })

    await fitnessApi.me('token-123')

    const [config] = getMock().mock.calls[0]
    expect(config.headers.Authorization).toBe('Bearer token-123')
  })

  it('throws API message on non-2xx response', async () => {
    const err = new Error('bad') as Error & {
      response?: { data: unknown; status: number }
      isAxiosError?: boolean
    }
    err.response = { data: { message: 'Неверный пароль' }, status: 401 }
    err.isAxiosError = true
    getMock().mockRejectedValue(err)

    await expect(fitnessApi.login('user@example.com', 'wrong')).rejects.toThrow(
      'Неверный пароль'
    )
  })
})
