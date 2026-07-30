import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Layers, LogOut, User as UserIcon, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090a0c]/80 border-b border-[#4a4b50]/40 px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5683da] to-[#ff8964] p-0.5 flex items-center justify-center shadow-lg shadow-[#5683da]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#090a0c] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#ff8964]" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#5683da] transition-colors">
              Plate<span className="text-[#ff8964]">Pixel</span>
            </span>
            <span className="block text-[10px] text-[#95979e] uppercase tracking-wider font-mono">Agency Engine</span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm text-[#95979e]">
          <Link to="/" className="hover:text-white transition-colors">Public Site</Link>
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-white transition-colors flex items-center space-x-1">
                <Layers className="w-4 h-4 text-[#5683da]" />
                <span>Dashboard</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Auth / Profile Controls */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-[#111111] border border-[#4a4b50] rounded-full px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-[#5683da]/20 text-[#5683da] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-medium text-white leading-tight">{user.name}</p>
                  <span className={`tag-pill text-[9px] uppercase ${
                    user.role === 'ADMIN' 
                      ? 'bg-[#5683da]/20 text-[#5683da]' 
                      : user.role === 'CLIENT'
                      ? 'bg-[#ff8964]/20 text-[#ff8964]'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-pill-secondary flex items-center space-x-2 py-1.5 px-3 text-xs"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 text-[#95979e]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="btn-pill-secondary py-2 px-5 text-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-pill-primary py-2 px-5 text-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
