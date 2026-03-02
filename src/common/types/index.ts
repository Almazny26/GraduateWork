// сюда вынес то, что юзается в разных местах - чтобы не дублировать

export type User = {
  name: string
  login: string
  email: string
  selectedCourses: string[]
  avatarUrl?: string
}

export type AuthContextValue = {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  login: (user: User, token: string) => void
  logout: () => void
  refreshMe: () => Promise<void>
  loginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

/** ссылка на курс для карточек и навигации (после маппинга с API) */
export type AppCourseRef = {
  courseId: string
  slug: string
  title: string
  image: string
  imageSkillCard: string
}
