import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { fitnessApi } from '@/api/fitness'

jest.mock('@/api/fitness', () => ({
  AUTH_TOKEN_STORAGE_KEY: 'skyfitness_auth_token',
  fitnessApi: {
    me: jest.fn(),
  },
}))

function Probe() {
  const { isLoggedIn, user, token } = useAuth()
  return (
    <div>
      <span data-testid="logged">{String(isLoggedIn)}</span>
      <span data-testid="email">{user?.email ?? ''}</span>
      <span data-testid="token">{token ?? ''}</span>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('restores session from token and /users/me', async () => {
    localStorage.setItem('skyfitness_auth_token', 'token-123')
    ;(fitnessApi.me as jest.Mock).mockResolvedValue({
      email: 'user@example.com',
      selectedCourses: ['course-1'],
    })

    const { getByTestId } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(getByTestId('logged')).toHaveTextContent('true')
      expect(getByTestId('email')).toHaveTextContent('user@example.com')
      expect(getByTestId('token')).toHaveTextContent('token-123')
    })
  })

  it('drops invalid token if /users/me fails', async () => {
    localStorage.setItem('skyfitness_auth_token', 'bad-token')
    ;(fitnessApi.me as jest.Mock).mockRejectedValue(new Error('invalid token'))

    const { getByTestId } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(getByTestId('logged')).toHaveTextContent('false')
      expect(localStorage.getItem('skyfitness_auth_token')).toBeNull()
    })
  })
})

