import React, { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles.css';
import { BudgetProvider } from './context/BudgetContext';
import { AuthProvider } from './context/AuthContext';

type MountComponent = React.ComponentType<any>;

let root: Root | null = null;

const getAppBasePath = () => {
  const [, firstSegment] = window.location.pathname.split('/');
  return firstSegment ? `/${firstSegment}` : '/';
};

const Providers = ({ children }: { children: ReactNode }) => (
  <React.StrictMode>
    <BrowserRouter basename={getAppBasePath()}>
      <AuthProvider>
        <BudgetProvider>{children}</BudgetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

export const mount = (Component: MountComponent, element: Element, _options?: unknown) => {
  root = createRoot(element);
  root.render(
    <Providers>
      <Component />
    </Providers>,
  );
};

export const unmount = () => {
  if (root) {
    root.unmount();
    root = null;
  }
};

const moduleDefault = { default: App };

export default moduleDefault;