import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Target, Zap, Users, Code, ArrowRight } from 'lucide-react';
import { Footer } from '../components/Footer';

export const About: React.FC = () => {
  return (
    <div className="bg-[#090a0c] text-white min-h-screen relative overflow-hidden">
      {/* Background Glow */}
      <div className="aurora-beam" />

      {/* Header */}
      <section className="pt-16 pb-12 px-6 max-w-7xl mx-auto text-center relative z-10">
        <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-xs uppercase">About PlatePixel</span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mt-4 mb-4">
          Eliminating Spreadsheets & <span className="text-[#5683da]">Manual Chaos</span> for Digital Agencies
        </h1>
        <p className="text-base text-[#95979e] max-w-2xl mx-auto">
          PlatePixel is built on a single mission: empowering local business clients while giving agency owners total operational control from a single dashboard.
        </p>
      </section>

      {/* Story & Problem Statement */}
      <section className="py-12 px-6 max-w-5xl mx-auto relative z-10">
        <div className="huly-card p-8 md:p-12 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Target className="w-6 h-6 text-[#ff8964]" />
            <span>The Problem We Solved</span>
          </h2>
          <p className="text-sm text-[#95979e] leading-relaxed">
            Small web agencies and digital freelancers typically manage leads in WhatsApp, clients in Excel spreadsheets, projects manually over email, payments in paper notebooks, and support requests in chats.
          </p>
          <p className="text-sm text-[#95979e] leading-relaxed">
            This causes lost leads, missed renewal deadlines, delayed project deliveries, and poor client satisfaction. PlatePixel brings together website delivery, recurring subscription management, lead pipelines, custom invoices, and client support into a single unified workspace.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#4a4b50]/40">
            <div className="p-4 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40">
              <div className="text-xl font-bold text-white">Centralized CRM</div>
              <div className="text-xs text-[#95979e] mt-1">1-Click conversion from lead to active client.</div>
            </div>
            <div className="p-4 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40">
              <div className="text-xl font-bold text-[#5683da]">Client Portal</div>
              <div className="text-xs text-[#95979e] mt-1">Self-service dashboard for invoices & project tracking.</div>
            </div>
            <div className="p-4 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40">
              <div className="text-xl font-bold text-[#ff8964]">Automated Care</div>
              <div className="text-xs text-[#95979e] mt-1">Renewal alerts & welcome notifications via Resend.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Values */}
      <section className="py-12 px-6 max-w-7xl mx-auto relative z-10 mb-16">
        <h2 className="text-2xl font-bold text-center text-white mb-10">Our Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="huly-card p-6">
            <ShieldCheck className="w-8 h-8 text-[#5683da] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Uncompromising Quality</h3>
            <p className="text-xs text-[#95979e]">
              Every website and web app we produce is hand-crafted with React 19, Vite, and modern styling for sub-second load times.
            </p>
          </div>

          <div className="huly-card p-6">
            <Zap className="w-8 h-8 text-[#ff8964] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Rapid Turnaround</h3>
            <p className="text-xs text-[#95979e]">
              Our streamlined workflows allow starter business websites to launch in as little as 7 business days.
            </p>
          </div>

          <div className="huly-card p-6">
            <Users className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Complete Transparency</h3>
            <p className="text-xs text-[#95979e]">
              Clients enjoy complete visibility into project milestones, open support tickets, and invoice status via their private portal.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
