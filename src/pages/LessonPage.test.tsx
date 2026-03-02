import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LessonPage } from '@/pages/LessonPage'
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
    getWorkoutById: jest.fn(),
    getWorkoutProgress: jest.fn(),
    saveWorkoutProgress: jest.fn(),
    getCourseWorkouts: jest.fn(),
  },
}))

describe('LessonPage progress flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({
      token: 'jwt-token',
      openLoginModal: jest.fn(),
    })
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
    ;(fitnessApi.getWorkoutById as jest.Mock).mockResolvedValue({
      _id: 'w1',
      name: 'Урок 1. База',
      video: 'https://www.youtube.com/embed/test',
      exercises: [
        { _id: 'e1', name: 'Крендель', quantity: 15 },
        { _id: 'e2', name: 'Планка', quantity: 30 },
        { _id: 'e3', name: 'Скручивания', quantity: 20 },
      ],
    })
    ;(fitnessApi.getWorkoutProgress as jest.Mock).mockResolvedValue({
      workoutId: 'w1',
      workoutCompleted: false,
      progressData: [0, 0, 0],
    })
    ;(fitnessApi.getCourseWorkouts as jest.Mock).mockResolvedValue([
      { _id: 'w1', name: 'Урок 1. База', video: '', exercises: [] },
    ])
    ;(fitnessApi.saveWorkoutProgress as jest.Mock).mockResolvedValue({})
  })

  it('sends correct progressData on save', async () => {
    render(
      <MemoryRouter initialEntries={['/course/yoga/lesson/w1']}>
        <Routes>
          <Route
            path="/course/:slug/lesson/:lessonId"
            element={<LessonPage />}
          />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(fitnessApi.getWorkoutById).toHaveBeenCalled())

    const openButtons = screen.getAllByRole('button', {
      name: /заполнить свой прогресс|обновить свой прогресс/i,
    })
    fireEvent.click(openButtons[0])

    await screen.findByText('Мой прогресс')
    const inputs = screen.getAllByPlaceholderText('0')
    fireEvent.change(inputs[0], { target: { value: '10' } })
    fireEvent.change(inputs[1], { target: { value: '20' } })
    fireEvent.change(inputs[2], { target: { value: '5' } })

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      expect(fitnessApi.saveWorkoutProgress).toHaveBeenCalledWith(
        'course-yoga-id',
        'w1',
        [10, 20, 5],
        'jwt-token'
      )
    })
  })
})
