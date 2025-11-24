import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import App from './App'

let root: Root | null = null

export const mount = (Component: typeof App, el: HTMLElement, _deps?: { push?: (path: string) => void }) => {
  root = createRoot(el)
  root.render(
    <React.StrictMode>
      <Component />
    </React.StrictMode>,
  )
}

export const unmount = () => {
  if (root) {
    root.unmount()
    root = null
  }
}

export default App

