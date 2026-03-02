import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi } from '@/api/fitness'

jest.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header" />,
}))

jest.mock('@/components/Hero', () => ({
  Hero: () => <div data-testid="hero" />,
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/api/fitness', () => ({
  fitnessApi: {
    getCourses: jest.fn(),
    addCourseToUser: jest.fn(),
  },
}))

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fitnessApi.getCourses as jest.Mock).mockResolvedValue([
      {
        _id: 'course-yoga-id',
        nameRU: 'Йога',
        nameEN: 'Yoga',
        description: 'desc',
        directions: [],
        fitting: [],
        workouts: [],
      },
    ])
  })

  it('loads courses from API on mount', async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      openLoginModal: jest.fn(),
      refreshMe: jest.fn(),
    })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(fitnessApi.getCourses).toHaveBeenCalled()
    })
    expect(screen.getByText('Йога')).toBeInTheDocument()
  })

  it('opens login modal when guest clicks add course', async () => {
    const openLoginModal = jest.fn()
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      openLoginModal,
      refreshMe: jest.fn(),
    })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => expect(fitnessApi.getCourses).toHaveBeenCalled())

    const addButtons = screen.getAllByRole('button', { name: 'Добавить курс' })
    fireEvent.click(addButtons[0])

    expect(openLoginModal).toHaveBeenCalled()
    expect(fitnessApi.addCourseToUser).not.toHaveBeenCalled()
  })

  it('renders "Наверх" button linking to #top', async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      openLoginModal: jest.fn(),
      refreshMe: jest.fn(),
    })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => expect(fitnessApi.getCourses).toHaveBeenCalled())

    const topLink = screen.getByRole('link', { name: /наверх/i })
    expect(topLink).toBeInTheDocument()
    expect(topLink).toHaveAttribute('href', '#top')
  })

  it('displays API error when getCourses fails', async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      openLoginModal: jest.fn(),
      refreshMe: jest.fn(),
    })
    ;(fitnessApi.getCourses as jest.Mock).mockRejectedValue(
      new Error('Network error')
    )

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(
        screen.getByText('Не удалось загрузить курсы с сервера')
      ).toBeInTheDocument()
    })
  })
})
