export type ExerciseDef = {
  key: 'forward' | 'backward' | 'knees'
  label: string
  question: string
}

export type ExerciseItem = {
  id: string
  key: ExerciseDef['key']
  label: string
  question: string
  quantity: number
}

export type SelectedLessonItem = {
  id: string
  title: string
}
