import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { CoursePage } from '@/pages/CoursePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/course/:slug" element={<CoursePage />} />
    </Routes>
  )
}

export default App
