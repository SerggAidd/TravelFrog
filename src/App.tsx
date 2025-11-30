import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Explore } from './pages/Explore'
import { Trips } from './pages/Trips'
import { Intelligence } from './pages/Intelligence'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { GlobalStyles } from './styles/global'

/**
 * Вычисляет basename для роутера на основе текущего пути.
 * Поддерживает деплой в корень домена и в поддиректорию.
 * 
 * Логика:
 * - Если путь начинается с известных маршрутов приложения, basename = '/'
 * - Иначе ищем паттерн деплоя (например, /apps/TravelFrog/main) и возвращаем путь до приложения
 */
const computeBasename = () => {
  const pathname = window.location.pathname
  const segments = pathname.split('/').filter(Boolean)
  
  // Известные маршруты приложения
  const appRoutes = ['explore', 'trips', 'intelligence', 'auth']
  
  // Если путь пустой - деплой в корень
  if (segments.length === 0) {
    return '/'
  }
  
  // Если первый сегмент - это маршрут приложения, значит деплой в корень
  if (appRoutes.includes(segments[0])) {
    return '/'
  }
  
  // Ищем паттерн деплоя: /apps/TravelFrog/main
  // Если путь содержит 'main', то basename = /apps/TravelFrog/main
  const mainIndex = segments.indexOf('main')
  if (mainIndex >= 0) {
    // Возвращаем путь до 'main' включительно: /apps/TravelFrog/main
    return '/' + segments.slice(0, mainIndex + 1).join('/')
  }
  
  // Если путь содержит известный маршрут, basename - всё до него
  for (let i = 0; i < segments.length; i++) {
    if (appRoutes.includes(segments[i])) {
      // Найден маршрут, basename - всё до него
      return '/' + segments.slice(0, i).join('/')
    }
  }
  
  // Если маршрута нет и нет 'main', но путь не пустой
  // Возможно, это главная страница в поддиректории
  // Возвращаем весь путь (будет использован как basename)
  return '/' + segments.join('/')
}

const createRouter = (basename?: string) =>
  createBrowserRouter(
    [
      {
        element: (
          <>
            <GlobalStyles />
            <AppLayout />
          </>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'explore', element: <Explore /> },
          { path: 'trips', element: <Trips /> },
          { path: 'intelligence', element: <Intelligence /> },
          { path: 'auth/login', element: <Login /> },
          { path: 'auth/register', element: <Register /> },
        ],
      },
    ],
    {
      basename,
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    },
  )

export const App = () => {
  const basename = React.useMemo(() => {
    const candidate = computeBasename()
    return candidate === '/' ? undefined : candidate
  }, [])

  const router = React.useMemo(() => createRouter(basename), [basename])

  return <RouterProvider router={router} />
}

export default App

