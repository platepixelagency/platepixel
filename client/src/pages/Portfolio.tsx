import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink, ArrowRight, Star, Layers, Globe, Smartphone, RefreshCw } from 'lucide-react';
import { Footer } from '../components/Footer';
import { supabase, subscribeToRealtimeTable } from '../services/supabase';

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  clientName: string;
  description: string;
  imageUrl: string;
  tags: string[];
  metrics: string;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: '1',
    title: 'Apex Culinary Lounge & QR Menu',
    category: 'Restaurant',
    clientName: 'Apex Hospitality Group',
    description: 'Modern dining restaurant portal equipped with real-time digital QR code menu, WhatsApp table reservation, and Google Maps integration.',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    tags: ['Restaurant Site', 'QR Menu', 'WhatsApp Ordering'],
    metrics: '+340% Digital Menu Scans',
  },
  {
    id: '2',
    title: 'Horizon SaaS Platform Dashboard',
    category: 'SaaS',
    clientName: 'Horizon Technologies',
    description: 'Full-stack web application featuring role-based client portal, subscription billing management, and real-time analytics.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Custom Web App', 'React 19', 'Express API'],
    metrics: '10k+ Monthly Active Users',
  },
  {
    id: '3',
    title: 'Aura Grand Weddings & RSVP Tracker',
    category: 'Wedding',
    clientName: 'Aura Event Studio',
    description: 'Luxury wedding celebration website featuring guest RSVP tracking, digital invitation cards, photo gallery, and event itinerary.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    tags: ['Wedding Site', 'RSVP Portal', 'Photo Gallery'],
    metrics: '500+ RSVP Submissions',
  },
  {
    id: '4',
    title: 'St. Jude International School Portal',
    category: 'School',
    clientName: 'St. Jude Educational Trust',
    description: 'Comprehensive academic institution website with online admission inquiry form, notice board, and parent information hub.',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['School Site', 'Admission Form', 'Notice Board'],
    metrics: '2.5k Students Enrolled',
  },
  {
    id: '5',
    title: 'Urban Wear Apparel Storefront',
    category: 'E-commerce',
    clientName: 'Urban Wear Co.',
    description: 'Fast-loading mobile e-commerce store with product catalog filtering, cart checkout, and automated customer order notifications.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    tags: ['E-commerce', 'Payment Gateway', 'Cart System'],
    metrics: '₹12,40,000 Sales Generated',
  },
];

export const Portfolio: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProjects = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('agency_portfolio')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: ProjectItem[] = data.map((p: any) => ({
          id: p.id,
          title: p.title || 'Untitled Showcase',
          category: p.category || 'Web Application',
          clientName: p.client_name || 'Agency Client',
          description: p.description || `Custom digital web platform designed for ${p.client_name || 'our client'}.`,
          imageUrl: p.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          tags: p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : p.tags) : ['Web App', 'Live Project'],
          metrics: p.metrics || 'Live Platform',
        }));
        setProjects(mapped);
      }
    } catch (err) {
      console.warn('[Portfolio] Failed to load from Supabase:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    const channel = subscribeToRealtimeTable('agency_portfolio', () => loadProjects(true));
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const categories = ['ALL', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = activeCategory === 'ALL'
    ? projects
    : projects.filter(p => p.category.toUpperCase().includes(activeCategory.toUpperCase()));

  return (
    <div className="bg-[#090a0c] text-white min-h-screen relative overflow-hidden">
      {/* Background Glow */}
      <div className="aurora-beam" />

      {/* Header */}
      <section className="pt-20 pb-14 px-6 max-w-7xl mx-auto text-center relative z-10">
        <div className="tag-pill-vip mb-6">
          <Sparkles className="w-4 h-4 text-[#ff8964] animate-spin-slow" />
          <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">Agency Portfolio Showcase</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mt-3 mb-6 leading-tight">
          Recent Projects Delivered by <span className="text-vip-shimmer">PlatePixel</span>
        </h1>

        <p className="text-base sm:text-lg text-[#95979e] max-w-2xl mx-auto leading-relaxed">
          Explore our showcase of custom websites, QR menu portals, and web applications built for growing businesses.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`tag-pill transition-all py-2 px-5 text-xs ${
                activeCategory === cat
                  ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/30 font-semibold'
                  : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
              }`}
            >
              {cat === 'ALL' ? '🌟 All Projects' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-8 px-6 max-w-7xl mx-auto relative z-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map(project => (
            <div key={project.id} className="huly-card overflow-hidden group flex flex-col justify-between transition-all transform hover:-translate-y-2 hover:shadow-[0_0_35px_rgba(86,131,218,0.25)] border-[#4a4b50]/50 hover:border-[#5683da]/50">
              {/* Real Project Image Showcase Container */}
              <div className="h-64 relative overflow-hidden bg-[#111111] border-b border-[#4a4b50]/40">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to dark placeholder if image fails
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
                  }}
                />

                {/* Glassmorphic Overlay Header Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090a0c] via-transparent to-black/60 p-5 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start pointer-events-auto">
                    <span className="tag-pill bg-[#090a0c]/90 text-[#ff8964] border border-[#ff8964]/40 font-mono text-[10px] backdrop-blur-md">
                      {project.category}
                    </span>
                    <div className="bg-[#090a0c]/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-semibold shadow-md">
                      {project.metrics}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-[#5683da] uppercase font-bold tracking-wider block drop-shadow">{project.clientName}</span>
                    <h3 className="text-xl font-extrabold text-white group-hover:text-[#5683da] transition-colors drop-shadow-md">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <p className="text-xs text-[#95979e] leading-relaxed mb-6">
                  {project.description}
                </p>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="tag-pill bg-[#111111] border border-[#4a4b50] text-[#95979e] text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/contact?service=${encodeURIComponent(project.title)}`}
                    className="btn-pill-secondary w-full py-2.5 text-xs text-center flex items-center justify-center space-x-2 group-hover:border-[#5683da]"
                  >
                    <span>Request Similar Project</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5683da]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};
