import React from 'react';
import './registerServiceWorker.ts';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const root = createRoot(document.body);
root.render(<App />);
