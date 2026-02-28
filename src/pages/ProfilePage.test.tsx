import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProfilePage } from '@/pages/ProfilePage'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi } from '@/api/fitness'

jest.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header" />,
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/api/fitness', () => ({
  fitnessApi: {
    getCourses: jest.fn(),
    deleteCourseFromUser: jest.fn(),
    resetCourseProgress: jest.fn(),
    getCourseProgress: jest.fn(),
    getCourseWorkouts: jest.fn(),
  },
}))

describe('ProfilePage API actions', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    ;(fitnessApi.getCourses as jest.Mock).mockResolvedValue([
      {
        _id: 'course-yoga-id',
        nameRU: 'Йога',
        nameEN: 'Yoga',
        description: 'desc',
        directions: [],
        fitting: [],
        workouts: ['w1'],
      },
    ])
    ;(fitnessApi.getCourseProgress as jest.Mock).mockResolvedValue({
      courseId: 'course-yoga-id',
      courseCompleted: true,
      workoutsProgress: [
        { workoutId: 'w1', workoutCompleted: true, progressData: [15, 30, 20] },
      ],
    })
    ;(fitnessApi.getCourseWorkouts as jest.Mock).mockResolvedValue([
      {
        _id: 'w1',
        name: 'Урок 1',
        video: '',
        exercises: [{ quantity: 15 }, { quantity: 30 }, { quantity: 20 }],
      },
    ])
  })

  it('removes course via API', async () => {
    const refreshMe = jest.fn().mockResolvedValue(undefined)
    ;(useAuth as jest.Mock).mockReturnValue({
      user: {
        name: 'user',
        login: 'user',
        email: 'user@example.com',
        selectedCourses: ['course-yoga-id'],
      },
      token: 'jwt-token',
      logout: jest.fn(),
      openLoginModal: jest.fn(),
      refreshMe,
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    const removeBtn = await screen.findByRole('button', {
      name: 'Удалить курс',
    })
    fireEvent.click(removeBtn)

    await waitFor(() => {
      expect(fitnessApi.deleteCourseFromUser).toHaveBeenCalledWith(
        'course-yoga-id',
        'jwt-token'
      )
      expect(refreshMe).toHaveBeenCalled()
    })
  })

  it('resets course progress when pressing "Начать заново"', async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: {
        name: 'user',
        login: 'user',
        email: 'user@example.com',
        selectedCourses: ['course-yoga-id'],
      },
      token: 'jwt-token',
      logout: jest.fn(),
      openLoginModal: jest.fn(),
      refreshMe: jest.fn(),
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    await waitFor(
      () => expect(fitnessApi.getCourseProgress).toHaveBeenCalled(),
      { timeout: 3000 }
    )
    const resetBtn = await screen.findByRole(
      'button',
      { name: 'Начать заново' },
      { timeout: 5000 }
    )
    fireEvent.click(resetBtn)

    await waitFor(() => {
      expect(fitnessApi.resetCourseProgress).toHaveBeenCalledWith(
        'course-yoga-id',
        'jwt-token'
      )
    })
  })
})
