import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Code, 
  QrCode, 
  Search, 
  ShieldCheck, 
  Bot, 
  Zap,
  Globe,
  Smartphone,
  Star,
  Users,
  Building,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { Footer } from '../components/Footer';

export const Home: React.FC = () => {
  const [heroStats, setHeroStats] = useState({
    clientProjects: '24 Active',
    leadCrmWon: '$48,500',
    maintenanceRenewals: '98% On Time',
  });

  useEffect(() => {
    fetch('/api/catalog/hero-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setHeroStats(data.stats);
      })
      .catch((err) => console.error('Failed to load hero stats:', err));
  }, []);
  return (
    <div className="bg-[#090a0c] text-white min-h-screen relative overflow-hidden">
      
      {/* Huly Aurora Beam Visual Effect */}
      <div className="aurora-beam" />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-[#111111] border border-[#4a4b50] rounded-full px-4 py-1.5 mb-6 shadow-xl shadow-[#5683da]/10 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[#ff8964]" />
          <span className="text-xs font-medium text-[#95979e]">
            Next-Gen Agency Platform for Local Businesses & Web Apps
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.08] mb-6">
          High-Performance Websites & Apps Built to <span className="bg-gradient-to-r from-[#5683da] via-[#94b3f2] to-[#ff8964] bg-clip-text text-transparent">Scale Your Business</span>
        </h1>

        <p className="text-base sm:text-lg text-[#95979e] max-w-2xl mx-auto mb-10 leading-relaxed">
          From starter business sites to custom CRMs, monthly maintenance, and AI chatbots — PlatePixel delivers custom digital solutions with a unified client portal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/contact" className="btn-pill-primary text-base py-3.5 px-8 flex items-center space-x-2 w-full sm:w-auto justify-center shadow-lg shadow-[#5683da]/30">
            <span>Start Your Project</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/services" className="btn-pill-secondary text-base py-3.5 px-8 w-full sm:w-auto text-center">
            Explore Services
          </Link>
        </div>

        {/* Product Screenshot Frame (Huly Aesthetic Mockup) */}
        <div className="relative max-w-5xl mx-auto">
          <div className="huly-card p-3 md:p-4 rounded-2xl border-[#4a4b50]/60 shadow-[0_10px_40px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 overflow-hidden">
              {/* Fake Window Bar */}
              <div className="bg-[#111111] px-4 py-2.5 border-b border-[#4a4b50]/40 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-[11px] font-mono text-[#95979e] ml-2">platepixel.agency/workspace/dashboard</span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-mono text-[#5683da] bg-[#5683da]/10 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5683da] animate-ping"></span>
                  <span>LIVE DEMO PREVIEW</span>
                </div>
              </div>

              {/* Mock Dashboard Preview Inner */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-[#111111] p-5 rounded-xl border border-[#4a4b50]/50 space-y-2">
                  <div className="text-xs text-[#95979e] uppercase font-mono">Client Projects</div>
                  <div className="text-2xl font-bold text-white">{heroStats.clientProjects}</div>
                  <div className="w-full bg-[#090a0c] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#5683da] h-full w-[80%]"></div>
                  </div>
                </div>

                <div className="bg-[#111111] p-5 rounded-xl border border-[#4a4b50]/50 space-y-2">
                  <div className="text-xs text-[#95979e] uppercase font-mono">Lead CRM Won</div>
                  <div className="text-2xl font-bold text-[#ff8964]">{heroStats.leadCrmWon}</div>
                  <div className="w-full bg-[#090a0c] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#ff8964] h-full w-[65%]"></div>
                  </div>
                </div>

                <div className="bg-[#111111] p-5 rounded-xl border border-[#4a4b50]/50 space-y-2">
                  <div className="text-xs text-[#95979e] uppercase font-mono">Maintenance Renewals</div>
                  <div className="text-2xl font-bold text-emerald-400">{heroStats.maintenanceRenewals}</div>
                  <div className="w-full bg-[#090a0c] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[98%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-y border-[#4a4b50]/40 bg-[#111111]/60 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">100+</div>
            <div className="text-xs text-[#95979e] mt-1 font-mono uppercase">Leads Generated</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#5683da]">30+</div>
            <div className="text-xs text-[#95979e] mt-1 font-mono uppercase">Active Retainer Clients</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#ff8964]">99.9%</div>
            <div className="text-xs text-[#95979e] mt-1 font-mono uppercase">Uptime & Security</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">100%</div>
            <div className="text-xs text-[#95979e] mt-1 font-mono uppercase">On-Time Delivery</div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="tag-pill bg-[#5683da]/20 text-[#5683da] uppercase tracking-wider font-mono">Full Spectrum Services</span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-3">
            Everything Your Business Needs to Thrive Online
          </h2>
          <p className="text-sm text-[#95979e] mt-3 max-w-2xl mx-auto">
            From modern responsive websites to automated CRM platforms and monthly maintenance retainers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="huly-card p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Starter Websites</h3>
              <p className="text-xs text-[#95979e] leading-relaxed mb-6">
                Sleek, lightning-fast business websites for restaurants, schools, wedding events, portfolios, and local service providers.
              </p>
              <ul className="space-y-2 text-xs text-white">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#5683da]" />
                  <span>Responsive Mobile Design</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#5683da]" />
                  <span>QR Menu & Digital Catalogs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#5683da]" />
                  <span>WhatsApp Lead Connection</span>
                </li>
              </ul>
            </div>
            <Link to="/services" className="mt-8 btn-pill-secondary text-xs text-center py-2.5">
              Learn More
            </Link>
          </div>

          {/* Card 2 */}
          <div className="huly-card p-8 flex flex-col justify-between border-[#ff8964]/40 relative">
            <div className="absolute top-4 right-4 tag-pill bg-[#ff8964]/20 text-[#ff8964] text-[10px]">
              POPULAR RETAINER
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ff8964]/10 text-[#ff8964] flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Monthly Growth</h3>
              <p className="text-xs text-[#95979e] leading-relaxed mb-6">
                Hands-free monthly care taking care of domain renewals, hosting management, SEO optimization, and monthly content edits.
              </p>
              <ul className="space-y-2 text-xs text-white">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#ff8964]" />
                  <span>Google Business Profile SEO</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#ff8964]" />
                  <span>24/7 Security & Uptime Monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#ff8964]" />
                  <span>AI Chatbot Lead Capture</span>
                </li>
              </ul>
            </div>
            <Link to="/pricing" className="mt-8 btn-pill-primary text-xs text-center py-2.5">
              View Retainer Plans
            </Link>
          </div>

          {/* Card 3 */}
          <div className="huly-card p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium Web Apps</h3>
              <p className="text-xs text-[#95979e] leading-relaxed mb-6">
                Custom web application development including CRMs, online ordering, billing engines, and inventory management.
              </p>
              <ul className="space-y-2 text-xs text-white">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tailor-Made Node/React Systems</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Client & Admin Dashboard Access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Custom API & Database Models</span>
                </li>
              </ul>
            </div>
            <Link to="/contact" className="mt-8 btn-pill-secondary text-xs text-center py-2.5">
              Request Custom Quote
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Lead Intake Banner */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="huly-card p-10 md:p-14 text-center relative overflow-hidden bg-gradient-to-r from-[#111111] via-[#151924] to-[#111111] border-[#5683da]/40">
          <div className="relative z-10">
            <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964] font-mono text-xs uppercase">Get Started Today</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">
              Ready to Upgrade Your Agency Digital Presence?
            </h2>
            <p className="text-sm text-[#95979e] max-w-xl mx-auto mb-8">
              Submit your project details in under 2 minutes. Our team will prepare a custom proposal and website preview.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact" className="btn-pill-primary py-3.5 px-8 text-sm flex items-center justify-center space-x-2">
                <span>Submit Lead Form</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" className="btn-pill-secondary py-3.5 px-8 text-sm text-center">
                Explore Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
