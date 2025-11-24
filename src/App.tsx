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

const computeBasename = () => {
  const [first] = window.location.pathname.split('/').filter(Boolean)
  return first ? `/${first}` : '/'
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

