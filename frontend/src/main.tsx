import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './AuthContext';  // ✅ import context

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>       {/* ✅ wrap App in AuthProvider */}
      <App />
    </AuthProvider>
  </StrictMode>,
);
