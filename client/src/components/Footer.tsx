import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Globe, ArrowRight, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090a0c] border-t border-[#4a4b50]/40 pt-16 pb-12 text-[#95979e] text-sm relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5683da]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
        {/* Col 1: Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5683da] to-[#ff8964] p-0.5 flex items-center justify-center shadow-lg shadow-[#5683da]/20">
              <div className="w-full h-full bg-[#090a0c] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#ff8964]" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">
                Plate<span className="text-[#ff8964]">Pixel</span>
              </span>
              <span className="block text-[10px] text-[#95979e] uppercase tracking-wider font-mono">Agency Platform</span>
            </div>
          </Link>

          <p className="text-xs text-[#95979e] leading-relaxed max-w-sm">
            PlatePixel is the all-in-one digital agency platform powering local business websites, custom web apps, hosting maintenance, and recurring growth support.
          </p>

          <div className="pt-2 flex items-center space-x-3 text-xs text-white">
            <div className="flex items-center space-x-1.5 bg-[#111111] border border-[#4a4b50] rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>99.9% Uptime Guarantee</span>
            </div>
          </div>
        </div>

        {/* Col 2: Starter Services */}
        <div>
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 font-mono">Starter Services</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/services" className="hover:text-white transition-colors">Business Websites</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Restaurant & QR Menus</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Wedding & Event Sites</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Portfolio & Personal Sites</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">School & Institution Sites</Link></li>
          </ul>
        </div>

        {/* Col 3: Monthly & Retainers */}
        <div>
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 font-mono">Growth Retainers</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/pricing" className="hover:text-white transition-colors">Website Maintenance</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Hosting & Domain Management</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">SEO & Google Profile Setup</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">AI Chatbot Integration</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">WhatsApp & CRM Systems</Link></li>
          </ul>
        </div>

        {/* Col 4: Navigation & Contact */}
        <div>
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 font-mono">Agency Links</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/portfolio" className="hover:text-white transition-colors">Client Portfolio</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About PlatePixel</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Get Started Lead Form</Link></li>
            <li><Link to="/login" className="text-[#5683da] hover:underline font-medium">Client Portal Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-[#4a4b50]/30 flex flex-col md:flex-row items-center justify-between text-xs text-[#95979e] gap-4">
        <p>© {new Date().getFullYear()} PlatePixel Agency Management Platform. All rights reserved.</p>
        <div className="flex items-center space-x-6">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-white cursor-pointer transition-colors">SLA Agreement</span>
        </div>
      </div>
    </footer>
  );
};
