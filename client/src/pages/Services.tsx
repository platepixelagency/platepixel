import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  QrCode, 
  Heart, 
  GraduationCap, 
  UserCheck, 
  Utensils, 
  Wrench, 
  ShieldAlert, 
  Bot, 
  MessageSquare, 
  Search, 
  TrendingUp, 
  Cpu, 
  CreditCard, 
  Calendar, 
  Boxes,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Footer } from '../components/Footer';

export const Services: React.FC = () => {
  return (
    <div className="bg-[#090a0c] text-white min-h-screen relative overflow-hidden">
      {/* Background Glow */}
      <div className="aurora-beam" />

      <section className="pt-20 pb-14 px-6 max-w-7xl mx-auto text-center relative z-10">
        <div className="tag-pill-vip mb-6">
          <Sparkles className="w-4 h-4 text-[#ff8964] animate-spin-slow" />
          <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">Comprehensive Services</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mt-3 mb-6 leading-tight">
          Tailored Web Solutions for <span className="text-vip-shimmer">Local Businesses</span> & <span className="bg-gradient-to-r from-[#ff8964] via-amber-300 to-[#ff8964] bg-clip-text text-transparent">Enterprises</span>
        </h1>
        
        <p className="text-base sm:text-lg text-[#95979e] max-w-2xl mx-auto leading-relaxed">
          Choose from our starter site builds, recurring monthly growth retainers, or full-scale custom web application development.
        </p>
      </section>

      {/* Category 1: Starter Services */}
      <section className="py-12 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center font-bold">
            01
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Starter Website Packages</h2>
            <p className="text-xs text-[#95979e]">Turnkey digital presence optimized for quick turnarounds and high conversion.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="huly-card p-6 flex flex-col justify-between">
            <div>
              <Utensils className="w-8 h-8 text-[#ff8964] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Restaurant & QR Menu Site</h3>
              <p className="text-xs text-[#95979e] mb-4">
                Interactive digital menu with QR code scan, online table reservation, Google maps integration, and WhatsApp ordering.
              </p>
            </div>
            <Link to="/contact?service=Restaurant Website" className="btn-pill-secondary text-xs text-center py-2">
              Select Package
            </Link>
          </div>

          <div className="huly-card p-6 flex flex-col justify-between">
            <div>
              <Globe className="w-8 h-8 text-[#5683da] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Business Website</h3>
              <p className="text-xs text-[#95979e] mb-4">
                Professional 5-page business site with services showcase, client testimonials, lead capture form, and mobile optimization.
              </p>
            </div>
            <Link to="/contact?service=Business Website" className="btn-pill-secondary text-xs text-center py-2">
              Select Package
            </Link>
          </div>

          <div className="huly-card p-6 flex flex-col justify-between">
            <div>
              <Heart className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Wedding & Event Site</h3>
              <p className="text-xs text-[#95979e] mb-4">
                Elegant wedding event site with RSVP tracker, photo gallery, event itinerary, venue maps, and gift registry.
              </p>
            </div>
            <Link to="/contact?service=Wedding Website" className="btn-pill-secondary text-xs text-center py-2">
              Select Package
            </Link>
          </div>

          <div className="huly-card p-6 flex flex-col justify-between">
            <div>
              <UserCheck className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Portfolio Website</h3>
              <p className="text-xs text-[#95979e] mb-4">
                Sleek personal branding portfolio for creators, consultants, designers, and freelancers to win high-ticket clients.
              </p>
            </div>
            <Link to="/contact?service=Portfolio Website" className="btn-pill-secondary text-xs text-center py-2">
              Select Package
            </Link>
          </div>

          <div className="huly-card p-6 flex flex-col justify-between">
            <div>
              <GraduationCap className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">School & Academy Site</h3>
              <p className="text-xs text-[#95979e] mb-4">
                Educational institute portal with course catalog, notice board, online inquiry form, and parent/student information.
              </p>
            </div>
            <Link to="/contact?service=School Website" className="btn-pill-secondary text-xs text-center py-2">
              Select Package
            </Link>
          </div>

          <div className="huly-card p-6 flex flex-col justify-between border-[#5683da]/40 bg-[#5683da]/5">
            <div>
              <QrCode className="w-8 h-8 text-[#5683da] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Custom Starter Package</h3>
              <p className="text-xs text-[#95979e] mb-4">
                Need something unique? We design custom starter websites tailored precisely to your brand assets and objectives.
              </p>
            </div>
            <Link to="/contact?service=Custom Starter" className="btn-pill-primary text-xs text-center py-2">
              Get Custom Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Category 2: Monthly Retainers */}
      <section className="py-12 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#ff8964]/10 text-[#ff8964] flex items-center justify-center font-bold">
            02
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Monthly Retainers & Growth Services</h2>
            <p className="text-xs text-[#95979e]">Continuous care, search engine growth, and automated lead capture.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="huly-card p-6">
            <Wrench className="w-6 h-6 text-[#ff8964] mb-3" />
            <h4 className="font-bold text-white mb-1">Website Maintenance</h4>
            <p className="text-xs text-[#95979e]">Regular backups, core updates, bug fixes, and performance optimization.</p>
          </div>

          <div className="huly-card p-6">
            <Search className="w-6 h-6 text-[#5683da] mb-3" />
            <h4 className="font-bold text-white mb-1">SEO & Google Profile</h4>
            <p className="text-xs text-[#95979e]">Local SEO setup, keyword ranking monitoring, and Google Business Profile optimization.</p>
          </div>

          <div className="huly-card p-6">
            <Bot className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="font-bold text-white mb-1">AI Chatbot Integration</h4>
            <p className="text-xs text-[#95979e]">Automated 24/7 lead intake bot answering visitor queries instantly.</p>
          </div>

          <div className="huly-card p-6">
            <MessageSquare className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="font-bold text-white mb-1">WhatsApp Lead Pipeline</h4>
            <p className="text-xs text-[#95979e]">Direct WhatsApp chat trigger connecting website visitors directly to your sales team.</p>
          </div>

          <div className="huly-card p-6">
            <ShieldAlert className="w-6 h-6 text-red-400 mb-3" />
            <h4 className="font-bold text-white mb-1">Security Monitoring</h4>
            <p className="text-xs text-[#95979e]">SSL certification, malware scanning, DDoS protection, and domain renewal tracking.</p>
          </div>

          <div className="huly-card p-6">
            <TrendingUp className="w-6 h-6 text-amber-400 mb-3" />
            <h4 className="font-bold text-white mb-1">Monthly Content Updates</h4>
            <p className="text-xs text-[#95979e]">Up to 5 content/image updates per month handled by our dedicated agency team.</p>
          </div>
        </div>
      </section>

      {/* Category 3: Premium Custom Web Apps */}
      <section className="py-12 px-6 max-w-7xl mx-auto relative z-10 mb-16">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            03
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Premium Custom Web Applications</h2>
            <p className="text-xs text-[#95979e]">Full-scale SaaS applications, custom CRMs, and enterprise tools.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="huly-card p-8 flex items-start space-x-4">
            <div className="p-3 bg-[#5683da]/10 text-[#5683da] rounded-xl flex-shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Custom Agency & Client CRMs</h4>
              <p className="text-xs text-[#95979e] leading-relaxed mb-4">
                Tailor-made CRM portals to manage client accounts, lead pipelines, support tickets, and invoicing from a unified interface.
              </p>
              <Link to="/contact?service=Custom CRM" className="text-xs text-[#5683da] font-medium flex items-center space-x-1 hover:underline">
                <span>Request Scope & Estimate</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="huly-card p-8 flex items-start space-x-4">
            <div className="p-3 bg-[#ff8964]/10 text-[#ff8964] rounded-xl flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Online Ordering & Billing Systems</h4>
              <p className="text-xs text-[#95979e] leading-relaxed mb-4">
                Integrated e-commerce checkout, subscription management, digital invoicing, and payment gateway connections.
              </p>
              <Link to="/contact?service=Billing System" className="text-xs text-[#ff8964] font-medium flex items-center space-x-1 hover:underline">
                <span>Request Scope & Estimate</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
