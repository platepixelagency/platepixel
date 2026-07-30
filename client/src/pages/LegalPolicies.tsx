import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, CheckCircle2, ArrowRight, Sparkles, Download, Clock } from 'lucide-react';
import { Footer } from '../components/Footer';

export const LegalPolicies: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'sla'>('privacy');

  useEffect(() => {
    if (location.pathname.includes('terms')) {
      setActiveTab('terms');
    } else if (location.pathname.includes('sla')) {
      setActiveTab('sla');
    } else {
      setActiveTab('privacy');
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#090a0c] text-[#95979e] flex flex-col font-sans relative overflow-hidden">
      {/* Background Aurora Effect */}
      <div className="aurora-beam" />

      {/* Header Banner */}
      <div className="relative z-10 pt-16 pb-12 text-center px-6 border-b border-[#4a4b50]/30 bg-[#090a0c]/60 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-[#111111] border border-[#4a4b50] rounded-full px-4 py-1.5 shadow-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-white">Trust & Compliance Standards</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Plate<span className="text-[#ff8964]">Pixel</span> Legal & Policy Center
          </h1>
          <p className="text-sm md:text-base text-[#95979e] max-w-2xl mx-auto leading-relaxed">
            Transparent governance, enterprise data privacy standards, client ownership terms, and our binding 99.9% Service Level Agreement.
          </p>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <Link
              to="/privacy"
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'privacy'
                  ? 'bg-gradient-to-r from-[#5683da] to-[#ff8964] text-white shadow-lg shadow-[#5683da]/25'
                  : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Privacy Policy</span>
            </Link>

            <Link
              to="/terms"
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'terms'
                  ? 'bg-gradient-to-r from-[#5683da] to-[#ff8964] text-white shadow-lg shadow-[#5683da]/25'
                  : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Terms of Service</span>
            </Link>

            <Link
              to="/sla"
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'sla'
                  ? 'bg-gradient-to-r from-[#5683da] to-[#ff8964] text-white shadow-lg shadow-[#5683da]/25'
                  : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SLA & Uptime Guarantee</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Legal Documentation Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-8 relative z-10">
        {/* TAB 1: PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="huly-card p-8 md:p-12 space-y-8 animate-fade-in-up border-[#5683da]/40">
            <div className="flex items-center justify-between border-b border-[#4a4b50]/40 pb-6">
              <div>
                <span className="text-xs font-mono text-[#5683da] uppercase tracking-wider">Effective: January 2026</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">Privacy Policy & Data Security</h2>
              </div>
              <div className="p-3 bg-[#5683da]/10 text-[#5683da] rounded-2xl">
                <Lock className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-6 text-sm text-[#95979e] leading-relaxed">
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#5683da]" />
                  <span>1. Information Collection & Client Data Confidentiality</span>
                </h3>
                <p>
                  PlatePixel Agency Management Platform respects your business privacy. We only collect essential client information required to provision websites, maintain monthly retainers, deliver custom web applications, and issue legal invoices. This includes name, corporate email, phone contact, company domain credentials, and technical spec assets.
                </p>
                <p>
                  We strict maintain zero-sale policy: <strong>PlatePixel will NEVER sell, lease, or monetize client business data to third-party advertisers or lead brokers.</strong>
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#5683da]" />
                  <span>2. Bank-Grade Encryption & Billing Security</span>
                </h3>
                <p>
                  All portal client passwords and sensitive session tokens are hashed using enterprise bcrypt salted standards. Payment transactions and invoice payments are processed via PCI-DSS compliant payment gateways with AES-256 SSL encryption.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#5683da]" />
                  <span>3. Client Rights & Data Portability</span>
                </h3>
                <p>
                  Clients retain full ownership of their proprietary assets, menu databases, and business copy. Upon termination of service or request, PlatePixel provides complete database exports and asset packages within 5 business days.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: TERMS OF SERVICE */}
        {activeTab === 'terms' && (
          <div className="huly-card p-8 md:p-12 space-y-8 animate-fade-in-up border-[#ff8964]/40">
            <div className="flex items-center justify-between border-b border-[#4a4b50]/40 pb-6">
              <div>
                <span className="text-xs font-mono text-[#ff8964] uppercase tracking-wider">Revised: Q1 2026</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">Master Terms of Service & Ownership</h2>
              </div>
              <div className="p-3 bg-[#ff8964]/10 text-[#ff8964] rounded-2xl">
                <FileText className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-6 text-sm text-[#95979e] leading-relaxed">
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#ff8964]" />
                  <span>1. Intellectual Property & Asset Transfer</span>
                </h3>
                <p>
                  Upon 100% full payment of custom web development project milestones or invoice balances, PlatePixel grants the client full, irrevocable ownership of all custom code, design mockups, restaurant menu data, and domain DNS setup.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#ff8964]" />
                  <span>2. Change Request Agreement (CRA) & Scope Governance</span>
                </h3>
                <p>
                  Any feature request or structural revision exceeding the initial signed project scope requirement will be documented under a <strong>Change Request Agreement (CRA)</strong> itemizing estimated hours and price adjustments before development execution.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#ff8964]" />
                  <span>3. Monthly AMC Maintenance & Retainer Billing</span>
                </h3>
                <p>
                  Growth retainers and AMC maintenance packages are billed monthly on the recurring cycle date. Monthly AMC includes continuous server monitoring, security patching, database backups, and up to 2 hours of complimentary monthly content edits.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* TAB 3: SLA & UPTIME GUARANTEE */}
        {activeTab === 'sla' && (
          <div className="huly-card p-8 md:p-12 space-y-8 animate-fade-in-up border-emerald-500/40">
            <div className="flex items-center justify-between border-b border-[#4a4b50]/40 pb-6">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Enterprise Guarantee</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">99.9% SLA & Uptime Commitment</h2>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
              <div className="p-5 bg-[#111111] border border-[#4a4b50] rounded-xl text-center space-y-1">
                <div className="text-3xl font-extrabold text-white font-mono">99.9%</div>
                <div className="text-xs text-[#95979e]">Guaranteed Uptime</div>
              </div>
              <div className="p-5 bg-[#111111] border border-[#4a4b50] rounded-xl text-center space-y-1">
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">&lt; 2 Hrs</div>
                <div className="text-xs text-[#95979e]">Critical Ticket Response</div>
              </div>
              <div className="p-5 bg-[#111111] border border-[#4a4b50] rounded-xl text-center space-y-1">
                <div className="text-3xl font-extrabold text-[#5683da] font-mono">24/7/365</div>
                <div className="text-xs text-[#95979e]">Automated Backup Protection</div>
              </div>
            </div>

            <div className="space-y-6 text-sm text-[#95979e] leading-relaxed">
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>1. Ticket Response Time SLA Matrix</span>
                </h3>
                <ul className="space-y-2 text-xs font-mono list-disc pl-5 text-[#95979e]">
                  <li><strong className="text-red-400">Critical Outage (P1):</strong> Immediate Response within 120 Minutes</li>
                  <li><strong className="text-amber-400">Urgent Edits (P2):</strong> Response within 4 Business Hours</li>
                  <li><strong className="text-[#5683da]">General Inquiries (P3):</strong> Response within 12 Business Hours</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>2. Outage SLA Credit Compensation</span>
                </h3>
                <p>
                  In the rare event that unscheduled server downtime drops below 99.9% in a monthly billing cycle, PlatePixel credits 10% of the monthly retainer fee for every 1 hour of unexcused downtime directly to the client's next invoice.
                </p>
              </section>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
