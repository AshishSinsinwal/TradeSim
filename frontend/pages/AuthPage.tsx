import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '@/services/authContext';
import { useWallet } from '@/services/WalletContext';
import { Mail, Lock, User } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const { refreshWallet } = useWallet();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleGoogleLogin = async (response: CredentialResponse) => {
    try {
      if (!response.credential) {
        throw new Error("No credential received from Google");
      }

      const { user, token } = await api.auth.google(response.credential);

      login(user, token);
      await refreshWallet();
      onLoginSuccess(); 

    } catch (err: any) {
      console.error('Google Login Failed:', err);
      setError(err.response?.data?.message || 'Google Login failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await api.login({ email: formData.email, password: formData.password });
        login(res.user, res.token);
          await refreshWallet();
      } else {
        const res = await api.register(formData);
        login(res.user, res.token);
          await refreshWallet();
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-zinc-500 text-sm">Join the most advanced trading simulator</p>
        </header>

        <div className="space-y-6">
          
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleLogin} 
              onError={() => setError("Google Login Failed")}
              theme="filled_black"
              shape="pill"
              size="large"
              width="350"
              text={isLogin ? "signin_with" : "signup_with"}
            />
          </div>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-zinc-600 text-xs uppercase font-bold">OR</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && <p className="text-red-400 text-xs text-center font-medium bg-red-400/10 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>

        <footer className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 text-sm hover:text-white transition-colors"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AuthPage;