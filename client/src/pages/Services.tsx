import React, { useState, useEffect } from 'react';
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
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Footer } from '../components/Footer';
import { supabase, subscribeToRealtimeTable } from '../services/supabase';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: '1',
    title: 'Restaurant Website & QR Menu',
    category: 'Food & Hospitality',
    price: '₹24,999',
    description: 'Interactive digital menu with QR code scan, online table reservation, Google maps integration, and WhatsApp ordering.',
    features: ['Live QR Menu Engine', 'Table Booking System', 'WhatsApp Order Direct', 'Google Maps Sync'],
    isPopular: true,
  },
  {
    id: '2',
    title: 'Business Website',
    category: 'Website Development',
    price: '₹14,999',
    description: 'Professional 5-page business site with services showcase, client testimonials, lead capture form, and mobile optimization.',
    features: ['5 Custom Pages', 'Mobile Responsive', 'Lead Intake Form', 'SEO Setup'],
    isPopular: false,
  },
  {
    id: '3',
    title: 'Wedding Website',
    category: 'Event Sites',
    price: '₹19,999',
    description: 'Elegant wedding event site with RSVP tracker, photo gallery, event itinerary, venue maps, and gift registry.',
    features: ['RSVP Guest Tracker', 'Photo & Video Gallery', 'Event Timeline', 'Venue Maps'],
    isPopular: false,
  },
  {
    id: '4',
    title: 'Portfolio Website',
    category: 'Branding',
    price: '₹14,999',
    description: 'Sleek personal branding portfolio for creators, consultants, designers, and freelancers to win high-ticket clients.',
    features: ['Project Showcase', 'Client Testimonials', 'Booking Integration', 'Contact Intake'],
    isPopular: false,
  },
  {
    id: '5',
    title: 'School Website',
    category: 'Education',
    price: '₹29,999',
    description: 'Educational institute portal with course catalog, notice board, online inquiry form, and parent information hub.',
    features: ['Online Admission Intake', 'Digital Notice Board', 'Faculty Directory', 'Event Calendar'],
    isPopular: false,
  },
  {
    id: '6',
    title: 'Growth Retainer',
    category: 'Maintenance & Support',
    price: '₹2,999 / mo',
    description: 'Continuous monthly web maintenance, automated daily backups, SSL renewal, content edits, and performance audits.',
    features: ['Managed Hosting Included', '24/7 Security Patches', 'SSL Certificate', 'Unlimited Content Updates'],
    isPopular: true,
  },
];

export const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState<boolean>(true);

  const loadServices = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('agency_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: ServiceItem[] = data.map((s: any) => ({
          id: s.id,
          title: s.title || 'Agency Service',
          category: s.category || 'Website Development',
          price: s.price || '₹14,999',
          description: s.description || '',
          features: s.features ? (typeof s.features === 'string' ? s.features.split(',').map((f: string) => f.trim()) : s.features) : [],
          isPopular: s.is_popular ?? false,
        }));
        setServices(mapped);
      }
    } catch (err) {
      console.warn('[Services] Failed to load from Supabase:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    const channel = subscribeToRealtimeTable('agency_services', () => loadServices(true));
    return () => {
      channel.unsubscribe();
    };
  }, []);

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

      {/* Dynamic Services Grid from Supabase */}
      <section className="py-12 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center font-bold">
              01
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Agency Core Services</h2>
              <p className="text-xs text-[#95979e]">Turnkey digital presence optimized for quick turnarounds and high conversion.</p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#5683da] bg-[#5683da]/10 px-3 py-1 rounded-full">
            {services.length} Live Offerings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className={`huly-card p-6 flex flex-col justify-between relative transition-all duration-300 ${
                svc.isPopular ? 'border-[#ff8964] shadow-[0_0_25px_rgba(255,137,100,0.15)] bg-[#ff8964]/5' : ''
              }`}
            >
              {svc.isPopular && (
                <div className="absolute -top-3.5 right-6 tag-pill bg-[#ff8964] text-black font-bold text-[10px] uppercase shadow-md">
                  POPULAR CHOICE
                </div>
              )}

              <div>
                <span className="tag-pill bg-[#5683da]/20 text-[#5683da] text-[10px] font-mono uppercase mb-3 inline-block">
                  {svc.category}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">{svc.title}</h3>
                <p className="text-xs text-[#95979e] mb-4 leading-relaxed">
                  {svc.description}
                </p>

                {svc.features && svc.features.length > 0 && (
                  <div className="space-y-1.5 mb-6 text-xs text-white">
                    {svc.features.map((f, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${svc.isPopular ? 'text-[#ff8964]' : 'text-[#5683da]'}`} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between border-t border-[#4a4b50]/40 pt-4">
                  <span className="text-xs text-[#95979e] font-mono">Investment:</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono">{svc.price}</span>
                </div>
                <Link
                  to={`/contact?service=${encodeURIComponent(svc.title)}`}
                  className={`w-full py-2.5 text-xs text-center block transition-all ${
                    svc.isPopular ? 'btn-pill-primary' : 'btn-pill-secondary'
                  }`}
                >
                  Select Package
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category 2: Monthly Retainers & Features */}
      <section className="py-12 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#ff8964]/10 text-[#ff8964] flex items-center justify-center font-bold">
            02
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Monthly Retainers & Growth Features</h2>
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
