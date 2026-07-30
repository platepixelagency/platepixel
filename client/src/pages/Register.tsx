import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, User, Building, Phone, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role: 'CLIENT',
        companyName,
        phone,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center p-6 bg-[#090a0c] overflow-hidden">
      {/* Background Aurora Effect */}
      <div className="aurora-beam" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-[#111111] border border-[#4a4b50] rounded-full px-4 py-1.5 mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#ff8964]" />
            <span className="text-xs font-medium text-[#95979e]">Client Portal Registration</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Create Client Account
          </h1>
          <p className="text-sm text-[#95979e]">
            Register your business client account to access your digital workspace
          </p>
        </div>

        <div className="huly-card p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="huly-input huly-input-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="huly-input huly-input-icon"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="huly-input huly-input-icon"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                  Company / Business Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Apex Culinary Lounge"
                    className="huly-input huly-input-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#95979e] text-xs font-medium uppercase tracking-wider mb-2">
                  Phone / Mobile
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="huly-input huly-input-icon"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill-primary w-full flex items-center justify-center space-x-2 py-3 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Client Portal Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#95979e] mt-6">
          Already have a client account?{' '}
          <Link to="/login" className="text-[#5683da] hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
