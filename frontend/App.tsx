import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TradingPage from './pages/TradingPage';
import WalletPage from './pages/WalletPage';
import AnomalyDashboard from './pages/AnomalyDashboard';
import AuthPage from './pages/AuthPage';
import { WalletProvider } from './services/WalletContext';
import { AuthProvider } from './services/authContext';
import { SocketManager } from './services/SocketManager';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isAuthenticated = () => {
  return Boolean(localStorage.getItem('token'));
};

const ProtectedRoute = ({ 
  children, 
  authenticated 
}: { 
  children: React.ReactNode; 
  authenticated: boolean 
}) => {
  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <WalletProvider>
            <SocketManager /> 

            <Router>
              <Routes>
                <Route
                  path="/auth"
                  element={
                    authenticated ? (
                      <Navigate to="/" replace />
                    ) : (
                      <AuthPage onLoginSuccess={() => setAuthenticated(true)} />
                    )
                  }
                />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute authenticated={authenticated}>
                      <TradingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute authenticated={authenticated}>
                      <WalletPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/anomalies"
                  element={
                    <ProtectedRoute authenticated={authenticated}>
                      <AnomalyDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </WalletProvider>
        </AuthProvider> 
  </GoogleOAuthProvider>
  );
};

export default App;