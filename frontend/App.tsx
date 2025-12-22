import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TradingPage from './pages/TradingPage';
import WalletPage from './pages/WalletPage';
import AuthPage from './pages/AuthPage';
import { WalletProvider } from './services/WalletContext';
import { AuthProvider } from './services/authContext';
import { SocketManager } from './services/SocketManager'; // 👈 ✅ NEW IMPORT

// Check token for initial routing state
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
  // We keep this local state specifically for Routing logic
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  return (
    <AuthProvider>
      <WalletProvider>
        {/* ✅ SOCKET MANAGER
           Placed inside Providers but outside Router.
           It automatically connects/disconnects based on AuthContext state.
        */}
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
          </Routes>
        </Router>
      </WalletProvider>
    </AuthProvider> 
  );
};

export default App;