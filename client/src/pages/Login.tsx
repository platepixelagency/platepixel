import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const { login, seedAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeedAdmin = async () => {
    try {
      setLoading(true);
      await seedAdmin();
      setEmail('admin@platepixel.com');
      setPassword('Admin@123');
      setSeedMessage('Default Admin account created & loaded! Click "Sign In to Workspace" to login.');
    } catch (err: any) {
      setError(err.message || 'Failed to seed admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center p-6 bg-[#090a0c] overflow-hidden">
      {/* Background Aurora Effect */}
      <div className="aurora-beam" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-[#111111] border border-[#4a4b50] rounded-full px-4 py-1.5 mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#ff8964]" />
            <span className="text-xs font-medium text-[#95979e]">PlatePixel Agency Portal v1.0</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-[#95979e]">
            Sign in to access your Agency Admin or Client Workspace
          </p>
        </div>

        {/* Huly Dark Glass Card */}
        <div className="huly-card p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {seedMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-3 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{seedMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  className="huly-input pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="huly-input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill-primary w-full flex items-center justify-center space-x-2 py-3 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-6 border-t border-[#4a4b50]/40 text-center">
            <p className="text-xs text-[#95979e] mb-3">Testing for the first time?</p>
            <button
              type="button"
              onClick={handleQuickSeedAdmin}
              className="btn-pill-secondary w-full text-xs py-2 border-[#5683da]/40 text-[#5683da] hover:bg-[#5683da]/10"
            >
              ⚡ Create & Autofill Demo Admin Account
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#95979e] mt-6">
          Don't have a client or team account yet?{' '}
          <Link to="/register" className="text-[#5683da] hover:underline font-medium">
            Register Account
          </Link>
        </p>
      </div>
    </div>
  );
};
