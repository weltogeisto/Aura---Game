import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useGameStore } from '@/stores/gameStore';
import './index.css';
import App from './App.tsx';

if (import.meta.env.DEV) {
  (window as Window & {
    __AURA_DEVTOOLS__?: {
      store: typeof useGameStore;
    };
  }).__AURA_DEVTOOLS__ = {
    store: useGameStore,
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
