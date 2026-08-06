import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ResponsiveProvider } from './context/ResponsiveContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

// Register PWA Service Worker with auto-update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('SW registered successfully:', reg.scope);
      // Check for updates on page load
      reg.update();
    }).catch((err) => {
      console.log('SW registration failed: ', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ResponsiveProvider>
          <App />
        </ResponsiveProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

