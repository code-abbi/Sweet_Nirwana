/**
 * Sweet Nirvana - Main Application Component
 * 
 * This is the root component of the Sweet Nirvana application.
 * It sets up the routing system and provides authentication context
 * throughout the entire application.
 * 
 * Features:
 * - React Router for client-side navigation
 * - Authentication context provider
 * - Main shop page and checkout page routing
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SweetShopPage from './pages/SweetShopPage';
import CheckoutPage from './pages/CheckoutPage';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import './App.css';

/**
 * Main App Component
 * 
 * Wraps the entire application with necessary providers and routing.
 * The AuthProvider ensures authentication state is available globally.
 * The ToastProvider enables auto-dismissing notifications throughout the app.
 */
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Main shop page - displays all sweets and features */}
            <Route path="/" element={<SweetShopPage />} />
            {/* Checkout page - handles order processing */}
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;