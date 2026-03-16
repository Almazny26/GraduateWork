// здесь мы подключаем разные штуки из библиотек и своих файлов
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/LoginModal'
import { HomePage } from '@/pages/HomePage'
import { CoursePage } from '@/pages/CoursePage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LessonPage } from '@/pages/LessonPage'

// этот маленький компонент просто листает страницу вверх,
// когда мы переходим по другим ссылкам в приложении
function ScrollToTop() {
  // здесь мы достаём текущий путь из роутера
  const { pathname } = useLocation()

  useEffect(() => {
    // каждый раз когда меняется адрес страницы, окно прокручивается наверх
    window.scrollTo(0, 0)
  }, [pathname])

  // компонент ничего не рисует, он нужен только ради эффекта выше
  return null
}

// здесь мы настраиваем какие страницы есть в приложении
function AppRoutes() {
  // через контекст авторизации получаем состояние модалки входа и функцию её закрытия
  const { loginModalOpen, closeLoginModal } = useAuth()

  return (
    <>
      {/* компонент, который всегда прокручивает экран вверх при смене страницы */}
      <ScrollToTop />
      <Routes>
        {/* главная страница сайта */}
        <Route path="/" element={<HomePage />} />
        {/* страница с конкретным курсом, slug - это текстовый id курса в адресе */}
        <Route path="/course/:slug" element={<CoursePage />} />
        {/* страница отдельного урока внутри курса, lessonId - номер урока */}
        <Route path="/course/:slug/lesson/:lessonId" element={<LessonPage />} />
        {/* страница профиля пользователя */}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      {/* всплывающие уведомления (тосты), появляются справа сверху */}
      <Toaster position="top-right" toastOptions={{ duration: 2600 }} />
      {/* модальное окно для авторизации, открывается/закрывается через контекст */}
      <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
    </>
  )
}

// это главный корневой компонент приложения
function App() {
  return (
    // здесь мы оборачиваем всё приложение в провайдер авторизации,
    // чтобы в любой части можно было узнать, залогинен пользователь или нет
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
