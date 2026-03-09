import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/LoginModal'
import { HomePage } from '@/pages/HomePage'
import { CoursePage } from '@/pages/CoursePage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LessonPage } from '@/pages/LessonPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppRoutes() {
  const { loginModalOpen, closeLoginModal } = useAuth()

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/course/:slug" element={<CoursePage />} />
        <Route path="/course/:slug/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 2600 }} />
      <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
