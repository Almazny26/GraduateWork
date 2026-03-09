export type ApiUserMe = {
  email: string
  selectedCourses: string[]
}

export type ApiCourse = {
  _id: string
  nameRU: string
  nameEN: string
  description: string
  directions: string[]
  fitting: string[]
  workouts: string[]
  difficulty?: string
  durationInDays?: number
  dailyDurationInMinutes?: {
    from: number
    to: number
  }
}

export type ApiWorkoutExercise = {
  _id: string
  name: string
  quantity: number
}

export type ApiWorkout = {
  _id: string
  name: string
  video: string
  exercises: ApiWorkoutExercise[]
}

export type ApiWorkoutProgress = {
  workoutId: string
  workoutCompleted: boolean
  progressData: number[]
}

export type ApiCourseProgress = {
  courseId: string
  courseCompleted: boolean
  workoutsProgress: ApiWorkoutProgress[]
}

export type ApiWorkoutProgressByWorkout = {
  workoutId: string
  workoutCompleted: boolean
  progressData: number[]
}
