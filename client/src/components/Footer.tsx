import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090a0c] border-t border-[#4a4b50]/40 py-6 text-[#95979e] text-xs relative overflow-hidden transition-all hover:border-[#5683da]/40">
      {/* Background Accent Glow */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#5683da]/10 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Uptime */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#5683da] to-[#ff8964] p-0.5 flex items-center justify-center shadow-md shadow-[#5683da]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090a0c] rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#ff8964]" />
              </div>
            </div>
            <span className="font-bold text-base tracking-tight text-white group-hover:text-[#5683da] transition-colors">
              Plate<span className="text-[#ff8964]">Pixel</span>
            </span>
          </Link>

          <span className="text-[#4a4b50]">|</span>

          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>99.9% Uptime SLA</span>
          </div>
        </div>

        {/* Compact Quick Nav */}
        <div className="flex items-center space-x-6 text-xs text-[#95979e]">
          <Link to="/services" className="hover:text-white transition-colors">Services</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link to="/login" className="text-[#5683da] hover:underline font-medium">Portal Login</Link>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-[#95979e]">
          © {new Date().getFullYear()} PlatePixel Agency. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
