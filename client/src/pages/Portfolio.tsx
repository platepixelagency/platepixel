import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink, ArrowRight, Star, Layers, Globe, Smartphone } from 'lucide-react';
import { Footer } from '../components/Footer';

interface ProjectItem {
  id: string;
  title: string;
  category: 'Restaurant' | 'SaaS' | 'Wedding' | 'School' | 'E-commerce';
  clientName: string;
  description: string;
  imageBg: string;
  tags: string[];
  metrics: string;
}

export const Portfolio: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const projects: ProjectItem[] = [
    {
      id: '1',
      title: 'Apex Culinary Lounge & QR Menu',
      category: 'Restaurant',
      clientName: 'Apex Hospitality Group',
      description: 'Modern dining restaurant portal equipped with real-time digital QR code menu, WhatsApp table reservation, and Google Maps integration.',
      imageBg: 'from-amber-600/30 to-red-900/40',
      tags: ['Restaurant Site', 'QR Menu', 'WhatsApp Ordering'],
      metrics: '+340% Digital Menu Scans',
    },
    {
      id: '2',
      title: 'Horizon SaaS Platform Dashboard',
      category: 'SaaS',
      clientName: 'Horizon Technologies',
      description: 'Full-stack web application featuring role-based client portal, subscription billing management, and real-time analytics.',
      imageBg: 'from-blue-600/30 to-indigo-900/40',
      tags: ['Custom Web App', 'React 19', 'Express API'],
      metrics: '10k+ Monthly Active Users',
    },
    {
      id: '3',
      title: 'Aura Grand Weddings & RSVP Tracker',
      category: 'Wedding',
      clientName: 'Aura Event Studio',
      description: 'Luxury wedding celebration website featuring guest RSVP tracking, digital invitation cards, photo gallery, and event itinerary.',
      imageBg: 'from-rose-600/30 to-purple-900/40',
      tags: ['Wedding Site', 'RSVP Portal', 'Photo Gallery'],
      metrics: '500+ RSVP Submissions',
    },
    {
      id: '4',
      title: 'St. Jude International School Portal',
      category: 'School',
      clientName: 'St. Jude Educational Trust',
      description: 'Comprehensive academic institution website with online admission inquiry form, notice board, and parent information hub.',
      imageBg: 'from-emerald-600/30 to-teal-900/40',
      tags: ['School Site', 'Admission Form', 'Notice Board'],
      metrics: '2.5k Students Enrolled',
    },
    {
      id: '5',
      title: 'Urban Wear Apparel Storefront',
      category: 'E-commerce',
      clientName: 'Urban Wear Co.',
      description: 'Fast-loading mobile e-commerce store with product catalog filtering, cart checkout, and automated customer order notifications.',
      imageBg: 'from-cyan-600/30 to-slate-900/40',
      tags: ['E-commerce', 'Payment Gateway', 'Cart System'],
      metrics: '$120k Sales Generated',
    },
  ];

  const filteredProjects = activeCategory === 'ALL'
    ? projects
    : projects.filter(p => p.category.toUpperCase() === activeCategory.toUpperCase());

  return (
    <div className="bg-[#090a0c] text-white min-h-screen relative overflow-hidden">
      {/* Background Glow */}
      <div className="aurora-beam" />

      {/* Header */}
      <section className="pt-16 pb-12 px-6 max-w-7xl mx-auto text-center relative z-10">
        <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-xs uppercase">Agency Portfolio</span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mt-4 mb-4">
          Recent Projects Delivered by <span className="text-[#5683da]">PlatePixel</span>
        </h1>
        <p className="text-base text-[#95979e] max-w-2xl mx-auto">
          Explore our showcase of custom websites, QR menu portals, and web applications built for growing businesses.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {['ALL', 'Restaurant', 'SaaS', 'Wedding', 'School', 'E-commerce'].map(cat => (
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
            <div key={project.id} className="huly-card overflow-hidden group flex flex-col justify-between">
              {/* Card Header Visual Mockup */}
              <div className={`h-52 bg-gradient-to-tr ${project.imageBg} relative p-6 flex flex-col justify-between border-b border-[#4a4b50]/40`}>
                <div className="flex justify-between items-start">
                  <span className="tag-pill bg-[#090a0c]/80 text-[#ff8964] border border-[#ff8964]/40 font-mono text-[10px]">
                    {project.category}
                  </span>
                  <div className="bg-[#090a0c]/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-semibold">
                    {project.metrics}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono text-[#95979e] uppercase block">{project.clientName}</span>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-[#5683da] transition-colors">
                    {project.title}
                  </h3>
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
                    className="btn-pill-secondary w-full py-2.5 text-xs text-center flex items-center justify-center space-x-2"
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
