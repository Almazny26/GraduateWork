import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginModal } from '@/components/LoginModal'
import { AuthProvider } from '@/contexts/AuthContext'
import { fitnessApi } from '@/api/fitness'

jest.mock('@/api/fitness', () => ({
  fitnessApi: {
    login: jest.fn(),
    me: jest.fn(),
  },
}))

function renderWithAuth(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe('LoginModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('closes and calls onClose after successful login', async () => {
    ;(fitnessApi.login as jest.Mock).mockResolvedValue({ token: 'jwt-token' })
    ;(fitnessApi.me as jest.Mock).mockResolvedValue({
      email: 'user@example.com',
      selectedCourses: [],
    })

    const onClose = jest.fn()

    renderWithAuth(
      <MemoryRouter>
        <LoginModal open onClose={onClose} />
      </MemoryRouter>
    )

    const emailInput = screen.getByPlaceholderText('Эл. почта')
    const passwordInput = screen.getByPlaceholderText('Пароль')

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    const submitButton = screen.getByRole('button', { name: 'Войти' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(fitnessApi.login).toHaveBeenCalledWith(
        'user@example.com',
        'Password123'
      )
      expect(fitnessApi.me).toHaveBeenCalledWith('jwt-token')
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows validation error when fields are empty', async () => {
    const onClose = jest.fn()

    renderWithAuth(
      <MemoryRouter>
        <LoginModal open onClose={onClose} />
      </MemoryRouter>
    )

    const submitButton = screen.getByRole('button', { name: 'Войти' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Заполните все поля.')).toBeInTheDocument()
    })
    expect(fitnessApi.login).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('displays API error on login failure', async () => {
    ;(fitnessApi.login as jest.Mock).mockRejectedValue(
      new Error('Неверный пароль')
    )

    const onClose = jest.fn()

    renderWithAuth(
      <MemoryRouter>
        <LoginModal open onClose={onClose} />
      </MemoryRouter>
    )

    const emailInput = screen.getByPlaceholderText('Эл. почта')
    const passwordInput = screen.getByPlaceholderText('Пароль')

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrong' } })

    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    await waitFor(() => {
      expect(
        screen.getByText(/пароль введен неверно|неверный пароль/i)
      ).toBeInTheDocument()
    })
    expect(onClose).not.toHaveBeenCalled()
  })
})
