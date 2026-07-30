import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Footer } from '../components/Footer';

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    navigate(`/contact?service=${encodeURIComponent(planName)}`);
  };

  return (
    <div className="bg-[#090a0c] text-white min-h-screen relative overflow-hidden">
      {/* Background Glow */}
      <div className="aurora-beam" />

      {/* Header */}
      <section className="pt-16 pb-12 px-6 max-w-7xl mx-auto text-center relative z-10">
        <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-xs uppercase">Transparent Pricing</span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mt-4 mb-4">
          Simple, Predictable Plans for <span className="text-[#5683da]">Every Stage</span>
        </h1>
        <p className="text-base text-[#95979e] max-w-2xl mx-auto">
          No hidden fees. Choose a one-time website package, a hands-free monthly retainer, or a custom application build.
        </p>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-8 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Plan 1: Starter Package */}
          <div className="huly-card p-8 flex flex-col justify-between">
            <div>
              <span className="tag-pill bg-[#5683da]/20 text-[#5683da] text-[10px] font-mono uppercase">One-Time Build</span>
              <h3 className="text-2xl font-bold text-white mt-3">Starter Website</h3>
              <p className="text-xs text-[#95979e] mt-1 mb-6">
                Ideal for local businesses, restaurants, portfolios, and event sites needing a fast launch.
              </p>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">₹14,999</span>
                <span className="text-xs text-[#95979e] ml-2">one-time investment</span>
              </div>

              <div className="space-y-3 text-xs text-[#95979e] mb-8">
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-[#5683da]" />
                  <span>5-Page Mobile Responsive Design</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-[#5683da]" />
                  <span>QR Menu / Catalog Integration</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-[#5683da]" />
                  <span>WhatsApp & Direct Lead Capture</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-[#5683da]" />
                  <span>Google Maps & SEO Setup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#5683da]" />
                  <span>Delivery in 7-10 Business Days</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Starter Website (₹14,999)')}
              className="btn-pill-secondary w-full py-3 text-xs text-center"
            >
              Choose Starter Plan
            </button>
          </div>

          {/* Plan 2: Monthly Retainer (Featured) */}
          <div className="huly-card p-8 flex flex-col justify-between border-[#ff8964] relative shadow-[0_0_30px_rgba(255,137,100,0.15)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 tag-pill bg-[#ff8964] text-black font-bold text-[10px] uppercase shadow-md">
              MOST POPULAR GROWTH PLAN
            </div>

            <div>
              <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964] text-[10px] font-mono uppercase">Monthly Retainer</span>
              <h3 className="text-2xl font-bold text-white mt-3">Growth & Care</h3>
              <p className="text-xs text-[#95979e] mt-1 mb-6">
                Complete hands-free maintenance, hosting, SEO monitoring, and security care.
              </p>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">₹2,999</span>
                <span className="text-xs text-[#95979e] ml-2">/ month</span>
              </div>

              <div className="space-y-3 text-xs text-[#95979e] mb-8">
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-[#ff8964]" />
                  <span>24/7 Hosting & Domain Management</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-[#ff8964]" />
                  <span>Monthly Content & Image Updates</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-[#ff8964]" />
                  <span>Local SEO & Google Business Rank</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-[#ff8964]" />
                  <span>AI Chatbot Lead Capture</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-[#ff8964]" />
                  <span>Client Portal Dashboard Access</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Growth Retainer (₹2,999/mo)')}
              className="btn-pill-primary w-full py-3 text-xs text-center"
            >
              Start Monthly Retainer
            </button>
          </div>

          {/* Plan 3: Premium Web App */}
          <div className="huly-card p-8 flex flex-col justify-between">
            <div>
              <span className="tag-pill bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase">Enterprise Custom</span>
              <h3 className="text-2xl font-bold text-white mt-3">Custom Web App</h3>
              <p className="text-xs text-[#95979e] mt-1 mb-6">
                Tailor-made web applications, CRMs, ordering engines, and inventory systems.
              </p>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">₹49,999+</span>
                <span className="text-xs text-[#95979e] ml-2">scoped build</span>
              </div>

              <div className="space-y-3 text-xs text-[#95979e] mb-8">
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Custom React / Express Architecture</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Role-Based Client & Admin Dashboards</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Database & REST API Engineering</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Payment Gateway & Invoicing System</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Dedicated Support SLA</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Custom Web App (₹49,999+)')}
              className="btn-pill-secondary w-full py-3 text-xs text-center border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            >
              Request App Scope
            </button>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto relative z-10">
        <h2 className="text-2xl font-bold text-center text-white mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="huly-card p-6">
            <h4 className="text-sm font-bold text-white mb-1">What is included in the Client Portal access?</h4>
            <p className="text-xs text-[#95979e]">
              Every client gets a dedicated dashboard login where you can track active web project progress, view & download PDF invoices, submit support tickets, and see domain renewal dates.
            </p>
          </div>

          <div className="huly-card p-6">
            <h4 className="text-sm font-bold text-white mb-1">Can I upgrade from a Starter Site to a Monthly Retainer later?</h4>
            <p className="text-xs text-[#95979e]">
              Yes! You can add monthly maintenance, SEO, or security monitoring to any website project at any time from your client dashboard.
            </p>
          </div>

          <div className="huly-card p-6">
            <h4 className="text-sm font-bold text-white mb-1">How quickly can my website launch?</h4>
            <p className="text-xs text-[#95979e]">
              Starter Websites typically launch within 7 to 10 business days once content and brand assets are submitted via our lead form.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
