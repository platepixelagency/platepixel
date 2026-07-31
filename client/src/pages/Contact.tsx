import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  User, 
  Building, 
  DollarSign, 
  MessageSquare,
  Globe
} from 'lucide-react';
import { fetchWithAuth } from '../services/api';
import { subscribeToRealtimeTable } from '../services/supabase';
import { Footer } from '../components/Footer';

export const Contact: React.FC = () => {
  const [searchParams] = useSearchParams();
  const prefilledService = searchParams.get('service') || 'Business Website';

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Website Development');
  const [service, setService] = useState(prefilledService);
  const [budget, setBudget] = useState('$500 - $1,500');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successLead, setSuccessLead] = useState<any>(null);
  const [dbServices, setDbServices] = useState<any[]>([]);

  const loadServices = async () => {
    try {
      const res = await fetchWithAuth<{ services: any[] }>('/catalog/services');
      if (res.services && res.services.length > 0) {
        setDbServices(res.services);
        if (!searchParams.get('service')) {
          setService(res.services[0].title);
        }
      }
    } catch (err) {
      console.warn('Notice loading DB services:', err);
    }
  };

  useEffect(() => {
    loadServices();
    const channel = subscribeToRealtimeTable('agency_services', () => loadServices());
    return () => { channel.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (searchParams.get('service')) {
      setService(searchParams.get('service')!);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await fetchWithAuth<{ lead: any }>('/leads', {
        method: 'POST',
        body: JSON.stringify({
          name,
          businessName,
          mobile,
          email,
          category,
          service,
          budget,
          message,
        }),
      });

      setSuccessLead(data.lead);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#090a0c] text-white min-h-screen relative overflow-hidden">
      {/* Background Glow */}
      <div className="aurora-beam" />

      {/* Header */}
      <section className="pt-20 pb-14 px-6 max-w-7xl mx-auto text-center relative z-10">
        <div className="tag-pill-vip mb-6">
          <Sparkles className="w-4 h-4 text-[#ff8964] animate-spin-slow" />
          <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">Get In Touch With Us</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mt-3 mb-6 leading-tight">
          Start Your Project with <span className="text-vip-shimmer">PlatePixel</span>
        </h1>

        <p className="text-base sm:text-lg text-[#95979e] max-w-2xl mx-auto leading-relaxed">
          Fill out the lead intake form below to receive a custom proposal and website timeline within 24 hours.
        </p>
      </section>

      {/* Form Container */}
      <section className="py-8 px-6 max-w-3xl mx-auto relative z-10 mb-20">
        <div className="huly-card p-8 md:p-12">
          {successLead ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white">Proposal Request Received!</h2>
              <p className="text-sm text-[#95979e] max-w-md mx-auto">
                Thank you <span className="text-white font-semibold">{name}</span>. Our lead management team has created lead record <span className="font-mono text-[#5683da]">#{successLead.id.substring(0, 8)}</span> and will contact you via WhatsApp or Email shortly.
              </p>

              <div className="p-4 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 max-w-md mx-auto text-left text-xs space-y-2 font-mono text-[#95979e]">
                <div><span className="text-white">Business:</span> {businessName || 'N/A'}</div>
                <div><span className="text-white">Service Selected:</span> {service}</div>
                <div><span className="text-white">Budget Range:</span> {budget}</div>
                <div><span className="text-white">Status:</span> <span className="text-emerald-400 font-bold">NEW (In Queue)</span></div>
              </div>

              <button
                onClick={() => {
                  setSuccessLead(null);
                  setName('');
                  setEmail('');
                  setMobile('');
                  setMessage('');
                }}
                className="btn-pill-primary py-2.5 px-6 text-xs"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="huly-input huly-input-icon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                    Business / Company Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Apex Culinary Group"
                      className="huly-input huly-input-icon"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                    Mobile / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                    <input
                      type="text"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                      className="huly-input huly-input-icon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sarah@apex.com"
                      className="huly-input huly-input-icon"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                    Service Required *
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="huly-input"
                  >
                    {dbServices.length > 0 ? (
                      dbServices.map((s) => (
                        <option key={s.id || s.title} value={s.title}>
                          {s.title} ({s.price})
                        </option>
                      ))
                    ) : (
                      <option value="">Loading database services...</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                    Estimated Budget Range
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="huly-input"
                  >
                    <option value="$300 - $500">$300 - $500</option>
                    <option value="$500 - $1,500">$500 - $1,500</option>
                    <option value="$1,500 - $3,000">$1,500 - $3,000</option>
                    <option value="$3,000+">$3,000+ Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#95979e] uppercase tracking-wider mb-2">
                  Project Details / Requirements
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-[#95979e]" />
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your business goals, target audience, preferred launch date, or specific feature requests..."
                    className="huly-input huly-input-icon pt-3"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-pill-primary w-full py-3.5 flex items-center justify-center space-x-2 text-sm"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Proposal Request</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
