import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TradingPage from './pages/TradingPage';
import WalletPage from './pages/WalletPage';
import AuthPage from './pages/AuthPage';
import { socketService } from './services/socket';
import { WalletProvider } from './services/WalletContext'; // 👈 Import Provider
import { AuthProvider} from './services/authContext';
// import { GoogleOAuthProvider } from '@react-oauth/google';

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
  const [authenticated, setAuthenticated] = React.useState(isAuthenticated());

  useEffect(() => {
    if (authenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
  }, [authenticated]);

  return (
    // 👈 Wrap with WalletProvider
    <AuthProvider>
      <WalletProvider> 
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