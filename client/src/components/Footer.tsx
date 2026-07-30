import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Mail, Phone, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090a0c] border-t border-[#4a4b50]/40 pt-10 pb-8 text-[#95979e] text-xs relative overflow-hidden transition-all hover:border-[#5683da]/40">
      {/* Background Accent Glow */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#5683da]/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Brand & Mission */}
        <div className="space-y-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5683da] to-[#ff8964] p-0.5 flex items-center justify-center shadow-lg shadow-[#5683da]/20 group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-[#090a0c] rounded-[9px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#ff8964]" />
              </div>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white group-hover:text-[#5683da] transition-colors">
                Plate<span className="text-[#ff8964]">Pixel</span>
              </span>
              <span className="block text-[9px] text-[#95979e] uppercase tracking-wider font-mono">Agency Platform</span>
            </div>
          </Link>

          <p className="text-xs text-[#95979e] leading-relaxed">
            All-in-one digital agency platform powering business websites, QR menus, custom SaaS CRMs, and hosting retainers.
          </p>

          <div className="inline-flex items-center space-x-1.5 bg-[#111111] border border-[#4a4b50]/60 rounded-full px-3 py-1 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>99.9% Uptime Guarantee</span>
          </div>
        </div>

        {/* Col 2: Services */}
        <div>
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3 font-mono">Core Services</h4>
          <ul className="space-y-2">
            <li><Link to="/services" className="hover:text-white transition-colors">Business & Restaurant Websites</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Digital QR Menus & Ordering</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Monthly Maintenance Retainers</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Custom SaaS & Web Apps</Link></li>
          </ul>
        </div>

        {/* Col 3: Agency Links */}
        <div>
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3 font-mono">Agency Links</h4>
          <ul className="space-y-2">
            <li><Link to="/portfolio" className="hover:text-white transition-colors">Client Work & Portfolio</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Plans & Pricing</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About PlatePixel</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Request Custom Proposal</Link></li>
            <li><Link to="/login" className="text-[#5683da] hover:underline font-medium">Client Portal Login</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact & Helpdesk */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3 font-mono">Client Support</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-[#5683da]" />
              <span>support@platepixel.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-[#ff8964]" />
              <span>+1 (555) 019-2831</span>
            </div>
          </div>

          <Link
            to="/login"
            className="btn-pill-primary py-2 px-4 text-xs inline-flex items-center space-x-1.5 mt-2"
          >
            <span>Open Helpdesk Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Sub Footer Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-[#4a4b50]/30 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#95979e] gap-3">
        <p>© {new Date().getFullYear()} PlatePixel Agency Management Platform. All rights reserved.</p>
        <div className="flex items-center space-x-5">
          <Link to="/privacy" className="hover:text-white cursor-pointer transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white cursor-pointer transition-colors">Terms of Service</Link>
          <Link to="/sla" className="hover:text-white cursor-pointer transition-colors">SLA Agreement</Link>
        </div>
      </div>
    </footer>
  );
};
