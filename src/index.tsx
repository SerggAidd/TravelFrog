import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { BudgetProvider } from './context/BudgetContext';
import { AuthProvider } from './context/AuthContext';

// Список возможных id контейнера: сначала 'root' (CRA), потом 'app' (часто бывает на платформах)
const CONTAINER_IDS = ['root', 'app'];

function getContainer(): HTMLElement {
  for (const id of CONTAINER_IDS) {
    const el = document.getElementById(id);
    if (el instanceof HTMLElement) {
      return el;
    }
  }

  // Если ничего не нашли — создаём div#root
  const fallback = document.createElement('div');
  fallback.id = CONTAINER_IDS[0];
  document.body.appendChild(fallback);
  return fallback;
}

const container = getContainer();
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BudgetProvider>
          <App />
        </BudgetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
