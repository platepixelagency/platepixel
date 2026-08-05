import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Footer } from '../components/Footer';
import { supabase, subscribeToRealtimeTable } from '../services/supabase';

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  tag?: string;
  buttonText?: string;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    title: 'Starter Website',
    price: '₹14,999',
    period: 'one-time investment',
    description: 'Ideal for local businesses, restaurants, portfolios, and event sites needing a fast launch.',
    features: [
      '5-Page Mobile Responsive Design',
      'QR Menu / Catalog Integration',
      'WhatsApp & Direct Lead Capture',
      'Google Maps & SEO Setup',
      'Delivery in 7-10 Business Days',
    ],
    highlighted: false,
    tag: 'One-Time Build',
    buttonText: 'Choose Starter Plan',
  },
  {
    id: 'growth',
    title: 'Growth & Care',
    price: '₹2,999',
    period: '/ month',
    description: 'Complete hands-free maintenance, hosting, SEO monitoring, and security care.',
    features: [
      '24/7 Hosting & Domain Management',
      'Monthly Content & Image Updates',
      'Local SEO & Google Business Rank',
      'AI Chatbot Lead Capture',
      'Client Portal Dashboard Access',
    ],
    highlighted: true,
    tag: 'Monthly Retainer',
    buttonText: 'Start Monthly Retainer',
  },
  {
    id: 'custom',
    title: 'Custom Web App',
    price: '₹49,999+',
    period: 'scoped build',
    description: 'Tailor-made web applications, CRMs, ordering engines, and inventory systems.',
    features: [
      'Custom React / Express Architecture',
      'Role-Based Client & Admin Dashboards',
      'Database & REST API Engineering',
      'Payment Gateway & Invoicing System',
      'Dedicated Support SLA',
    ],
    highlighted: false,
    tag: 'Enterprise Custom',
    buttonText: 'Request App Scope',
  },
];

export const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const loadPricing = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('agency_pricing')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: PricingPlan[] = data.map((p: any) => ({
          id: p.id,
          title: p.title || 'Custom Plan',
          price: p.price || 'Contact',
          period: p.period || 'per month',
          description: p.description || '',
          features: p.features ? (typeof p.features === 'string' ? p.features.split(',').map((f: string) => f.trim()) : p.features) : [],
          highlighted: p.highlighted ?? false,
          tag: p.period === 'one-time' ? 'One-Time Package' : 'Retainer Plan',
          buttonText: p.highlighted ? 'Start Growth Retainer' : `Select ${p.title}`,
        }));
        setPlans(mapped);
      }
    } catch (err) {
      console.warn('[Pricing] Failed to load from Supabase:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
    const channel = subscribeToRealtimeTable('agency_pricing', () => loadPricing(true));
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleSelectPlan = (planName: string) => {
    navigate(`/contact?service=${encodeURIComponent(planName)}`);
  };

  return (
    <div className="bg-[#090a0c] text-white min-h-screen relative overflow-hidden">
      {/* Background Glow */}
      <div className="aurora-beam" />

      {/* Header */}
      <section className="pt-20 pb-14 px-6 max-w-7xl mx-auto text-center relative z-10">
        <div className="tag-pill-vip mb-6">
          <Sparkles className="w-4 h-4 text-[#ff8964] animate-spin-slow" />
          <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">Transparent Pricing</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mt-3 mb-6 leading-tight">
          Simple, Predictable Plans for <span className="text-vip-shimmer">Every Stage</span>
        </h1>

        <p className="text-base sm:text-lg text-[#95979e] max-w-2xl mx-auto leading-relaxed">
          No hidden fees. Choose a one-time website package, a hands-free monthly retainer, or a custom application build.
        </p>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-8 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`huly-card p-8 flex flex-col justify-between relative transition-all duration-300 ${
                plan.highlighted ? 'border-[#ff8964] shadow-[0_0_30px_rgba(255,137,100,0.15)] bg-[#ff8964]/5' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 tag-pill bg-[#ff8964] text-black font-bold text-[10px] uppercase shadow-md whitespace-nowrap">
                  MOST POPULAR GROWTH PLAN
                </div>
              )}

              <div>
                <span className={`tag-pill text-[10px] font-mono uppercase ${plan.highlighted ? 'bg-[#ff8964]/20 text-[#ff8964]' : 'bg-[#5683da]/20 text-[#5683da]'}`}>
                  {plan.tag || (plan.highlighted ? 'Monthly Retainer' : 'Website Package')}
                </span>
                <h3 className="text-2xl font-bold text-white mt-3">{plan.title}</h3>
                <p className="text-xs text-[#95979e] mt-1 mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-[#95979e] ml-2 font-mono">{plan.period}</span>
                </div>

                <div className="space-y-3 text-xs text-[#95979e] mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-white">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-[#ff8964]' : 'text-[#5683da]'}`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(`${plan.title} (${plan.price})`)}
                className={`w-full py-3 text-xs text-center transition-all ${
                  plan.highlighted ? 'btn-pill-primary' : 'btn-pill-secondary'
                }`}
              >
                {plan.buttonText || `Choose ${plan.title}`}
              </button>
            </div>
          ))}
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

