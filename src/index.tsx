import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import { BudgetProvider } from './context/BudgetContext'
import { AuthProvider } from './context/AuthContext'

const getBasename = () => {
  if (typeof window === 'undefined') {
    return '/'
  }
  const custom = (window as typeof window & { __TRAVELFROG_BASENAME__?: string })
    .__TRAVELFROG_BASENAME__
  return custom || '/TravelForge'
}

const Root = () => (
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <AuthProvider>
        <BudgetProvider>
          <App />
        </BudgetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

export default Root

let rootElement: ReactDOM.Root | null = null

export const mount = (
  Component: React.ComponentType = Root,
  element: HTMLElement | null = document.getElementById('app') || document.getElementById('root'),
) => {
  if (!element) {
    throw new Error('Mount element not found')
  }

  rootElement = ReactDOM.createRoot(element)
  rootElement.render(<Component />)

  if (import.meta && import.meta.hot) {
    import.meta.hot.accept('./App', () => {
      rootElement?.render(<Component />)
    })
  }
}

export const unmount = () => {
  rootElement?.unmount()
  rootElement = null
}