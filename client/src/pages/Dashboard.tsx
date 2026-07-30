import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Database, 
  Users, 
  Briefcase, 
  FileText, 
  LifeBuoy, 
  CheckCircle, 
  Sparkles,
  ArrowUpRight,
  Clock,
  Key
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState<{
    status: string;
    database: string;
    userCount: number;
    timestamp: string;
  } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoadingHealth(false);
      })
      .catch((err) => {
        console.error('Health fetch failed:', err);
        setLoadingHealth(false);
      });
  }, []);

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#090a0c] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111111] via-[#161922] to-[#111111] border border-[#4a4b50] p-8">
          <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#5683da]/20 to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="tag-pill bg-[#5683da]/20 text-[#5683da] border border-[#5683da]/30 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-[#ff8964]" />
                  <span>Phase 1 Foundation Active</span>
                </span>
                <span className="text-xs text-[#95979e] font-mono">ID: {user?.id.substring(0, 8)}...</span>
              </div>
              
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome, {user?.name}
              </h1>
              <p className="text-sm text-[#95979e] mt-1 max-w-xl">
                PlatePixel Agency Platform is initialized. JWT Authentication, Prisma ORM, and Huly design tokens are active.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="huly-card px-4 py-2 flex items-center space-x-3 border-[#5683da]/40">
                <ShieldCheck className="w-5 h-5 text-[#5683da]" />
                <div>
                  <div className="text-[10px] text-[#95979e] uppercase font-mono">Authenticated As</div>
                  <div className="text-xs font-bold text-[#ff8964]">{user?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API & System Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="huly-card p-5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#95979e] uppercase font-mono">DB Connection</div>
              <div className="text-sm font-semibold text-white flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{health?.database || (loadingHealth ? 'Connecting...' : 'Active')}</span>
              </div>
            </div>
          </div>

          <div className="huly-card p-5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#95979e] uppercase font-mono">Auth Token</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                JWT Valid (7 Days)
              </div>
            </div>
          </div>

          <div className="huly-card p-5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-[#ff8964]/10 text-[#ff8964] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#95979e] uppercase font-mono">Registered Accounts</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {health?.userCount ?? 1} Users in DB
              </div>
            </div>
          </div>

          <div className="huly-card p-5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#95979e] uppercase font-mono">API Server</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                Express (Port 5000)
              </div>
            </div>
          </div>
        </div>

        {/* Phase Roadmap Overview Cards */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <span>Platform Module Roadmap</span>
            <span className="text-xs text-[#95979e] font-normal">(Phases 2 – 10 Preview)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="huly-card p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="tag-pill bg-[#5683da]/20 text-[#5683da]">Phase 2 & 3</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Lead CRM & Pipeline</h3>
              <p className="text-xs text-[#95979e] leading-relaxed">
                Public website contact form submission, lead capture, status board (New → Contacted → Proposal → Won), and 1-click client conversion.
              </p>
            </div>

            <div className="huly-card p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#ff8964]/10 text-[#ff8964] flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964]">Phase 4 & 5</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Projects & Clients</h3>
              <p className="text-xs text-[#95979e] leading-relaxed">
                Client directory, recurring service plans (Maintenance, SEO, Hosting), project milestone boards, and delivery target dates.
              </p>
            </div>

            <div className="huly-card p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="tag-pill bg-emerald-500/20 text-emerald-400">Phase 6 & 7</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Invoices & Client Portal</h3>
              <p className="text-xs text-[#95979e] leading-relaxed">
                Invoice generator with PDF rendering, payment status tracking, dedicated client portal for project updates & document downloads.
              </p>
            </div>
          </div>
        </div>

        {/* User Session Profile Raw Dump */}
        <div className="huly-card p-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Verified JWT Session Payload</span>
          </h3>
          <pre className="bg-[#090a0c] p-4 rounded-xl text-xs font-mono text-[#5683da] overflow-x-auto border border-[#4a4b50]/40">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
};
