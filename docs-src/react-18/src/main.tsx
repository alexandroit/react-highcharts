import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './app.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App reactLine="18.3.1" />
  </React.StrictMode>
);
