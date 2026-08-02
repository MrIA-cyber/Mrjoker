import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ResponsiveProvider } from './context/ResponsiveContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ResponsiveProvider>
        <App />
      </ResponsiveProvider>
    </ErrorBoundary>
  </StrictMode>,
);
