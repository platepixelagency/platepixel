import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Layers, LogOut, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090a0c]/85 border-b border-[#4a4b50]/40 px-6 py-3.5 transition-all">
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
            <span className="block text-[10px] text-[#95979e] uppercase tracking-wider font-mono">Agency Platform</span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm text-[#95979e]">
          <Link
            to="/"
            className={`transition-colors hover:text-white ${isActive('/') ? 'text-white font-semibold' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/services"
            className={`transition-colors hover:text-white ${isActive('/services') ? 'text-white font-semibold' : ''}`}
          >
            Services
          </Link>
          <Link
            to="/pricing"
            className={`transition-colors hover:text-white ${isActive('/pricing') ? 'text-white font-semibold' : ''}`}
          >
            Pricing
          </Link>
          <Link
            to="/portfolio"
            className={`transition-colors hover:text-white ${isActive('/portfolio') ? 'text-white font-semibold' : ''}`}
          >
            Portfolio
          </Link>
          <Link
            to="/about"
            className={`transition-colors hover:text-white ${isActive('/about') ? 'text-white font-semibold' : ''}`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`transition-colors hover:text-white ${isActive('/contact') ? 'text-white font-semibold' : ''}`}
          >
            Contact
          </Link>
        </nav>

        {/* Right Auth / Action Controls */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="btn-pill-secondary flex items-center space-x-1.5 py-1.5 px-4 text-xs border-[#5683da]/40 text-[#5683da]"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <div className="flex items-center space-x-2 bg-[#111111] border border-[#4a4b50] rounded-full px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-[#5683da]/20 text-[#5683da] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-white leading-tight">{user.name}</p>
                  <span
                    className={`tag-pill text-[9px] uppercase ${
                      user.role === 'ADMIN'
                        ? 'bg-[#5683da]/20 text-[#5683da]'
                        : user.role === 'CLIENT'
                        ? 'bg-[#ff8964]/20 text-[#ff8964]'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-pill-secondary py-1.5 px-3 text-xs"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 text-[#95979e]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="btn-pill-secondary py-2 px-5 text-sm">
                Portal Login
              </Link>
              <Link to="/contact" className="btn-pill-primary py-2 px-5 text-sm flex items-center space-x-1.5">
                <span>Start Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-[#95979e] hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="lg:hidden mt-3 pt-4 border-t border-[#4a4b50]/40 space-y-3">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-sm py-1.5 text-white">Home</Link>
          <Link to="/services" onClick={() => setMobileOpen(false)} className="block text-sm py-1.5 text-white">Services</Link>
          <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block text-sm py-1.5 text-white">Pricing</Link>
          <Link to="/portfolio" onClick={() => setMobileOpen(false)} className="block text-sm py-1.5 text-white">Portfolio</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="block text-sm py-1.5 text-white">About Us</Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)} className="block text-sm py-1.5 text-white">Contact & Request Quote</Link>
          {user ? (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block btn-pill-primary text-center py-2 text-sm mt-3">
              Go to Dashboard ({user.role})
            </Link>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-pill-secondary text-center py-2 text-sm">
                Client Portal Login
              </Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="btn-pill-primary text-center py-2 text-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
