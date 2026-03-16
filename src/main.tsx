// точка входа в наше React-приложение
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
// здесь подключаем общие стили для всего приложения
import './index.css'

// здесь мы говорим React, куда именно в html нужно "вмонтировать" всё приложение
createRoot(document.getElementById('root')!).render(
  // StrictMode помогает во время разработки подсвечивать потенциальные проблемы
  <StrictMode>
    {/* BrowserRouter отвечает за навигацию по страницам без перезагрузки сайта */}
    <BrowserRouter
      future={{
        // эти флаги включают более новое поведение роутера (рекомендуют в новых версиях)
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {/* сюда я передаю главный компонент приложения */}
      <App />
    </BrowserRouter>
  </StrictMode>
)
