import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CoursePage } from '@/pages/CoursePage'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi } from '@/api/fitness'

jest.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header" />,
}))

jest.mock('@/components/SkillCourseCard', () => ({
  SkillCourseCard: () => <div data-testid="skill-course-card" />,
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/api/fitness', () => ({
  fitnessApi: {
    getCourses: jest.fn(),
    getCourseById: jest.fn(),
    addCourseToUser: jest.fn(),
  },
}))

describe('CoursePage API actions', () => {
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
    ;(fitnessApi.getCourseById as jest.Mock).mockResolvedValue({
      _id: 'course-yoga-id',
      nameRU: 'Йога',
      nameEN: 'Yoga',
      description: 'Описание курса. Первый пункт. Второй пункт.',
      directions: ['Йога для новичков'],
      fitting: ['Подходит новичкам'],
      workouts: [],
    })
  })

  it('adds course for authorized user', async () => {
    const refreshMe = jest.fn().mockResolvedValue(undefined)
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'u@e.com', login: 'u', name: 'u', selectedCourses: [] },
      token: 'jwt-token',
      openLoginModal: jest.fn(),
      refreshMe,
    })

    render(
      <MemoryRouter initialEntries={['/course/yoga']}>
        <Routes>
          <Route path="/course/:slug" element={<CoursePage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(fitnessApi.getCourses).toHaveBeenCalled())

    const addButtons = screen.getAllByRole('button', { name: 'Добавить курс' })
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      expect(fitnessApi.addCourseToUser).toHaveBeenCalledWith(
        'course-yoga-id',
        'jwt-token'
      )
      expect(refreshMe).toHaveBeenCalled()
    })
  })

  it('opens login modal for guest user', async () => {
    const openLoginModal = jest.fn()
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      openLoginModal,
      refreshMe: jest.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/course/yoga']}>
        <Routes>
          <Route path="/course/:slug" element={<CoursePage />} />
        </Routes>
      </MemoryRouter>
    )

    const buttons = await screen.findAllByRole('button', {
      name: 'Войдите, чтобы добавить курс',
    })
    fireEvent.click(buttons[0])
    expect(openLoginModal).toHaveBeenCalled()
    expect(fitnessApi.addCourseToUser).not.toHaveBeenCalled()
  })
})
