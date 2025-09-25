/**
 * Sweet Nirvana - Application Entry Point
 * 
 * This file bootstraps the React application and mounts it to the DOM.
 * It provides the authentication context at the root level.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Get the root DOM element where React will mount
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the application with React StrictMode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
