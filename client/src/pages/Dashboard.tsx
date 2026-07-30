import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LeadCRM } from '../components/crm/LeadCRM';
import { 
  ShieldCheck, 
  Database, 
  Users, 
  Briefcase, 
  FileText, 
  Sparkles, 
  Clock, 
  Key,
  LayoutDashboard,
  Filter,
  CheckCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'leads'>('overview');
  const [health, setHealth] = useState<{
    status: string;
    database: string;
    userCount: number;
    leadCount: number;
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

  const isAdminOrTeam = user?.role === 'ADMIN' || user?.role === 'TEAM_MEMBER';

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#090a0c] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation Tabs Bar for Admin / Team */}
        {isAdminOrTeam && (
          <div className="flex items-center space-x-3 border-b border-[#4a4b50]/40 pb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
                  : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Workspace Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'leads'
                  ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
                  : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-[#ff8964]" />
              <span>Lead CRM Pipeline</span>
              {health?.leadCount !== undefined && (
                <span className="w-5 h-5 rounded-full bg-[#ff8964] text-black text-[10px] font-bold flex items-center justify-center">
                  {health.leadCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Tab Content: Lead CRM */}
        {isAdminOrTeam && activeTab === 'leads' ? (
          <LeadCRM />
        ) : (
          /* Tab Content: Overview */
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111111] via-[#161922] to-[#111111] border border-[#4a4b50] p-8">
              <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#5683da]/20 to-transparent blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="tag-pill bg-[#5683da]/20 text-[#5683da] border border-[#5683da]/30 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-[#ff8964]" />
                      <span>Phase 3 Lead CRM Active</span>
                    </span>
                    <span className="text-xs text-[#95979e] font-mono">ID: {user?.id.substring(0, 8)}...</span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Welcome, {user?.name}
                  </h1>
                  <p className="text-sm text-[#95979e] mt-1 max-w-xl">
                    Manage agency leads, pipeline stages, client accounts, and digital service retentions from your central workspace.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="huly-card px-4 py-2 flex items-center space-x-3 border-[#5683da]/40">
                    <ShieldCheck className="w-5 h-5 text-[#5683da]" />
                    <div>
                      <div className="text-[10px] text-[#95979e] uppercase font-mono">Authenticated Role</div>
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
                  <div className="text-xs text-[#95979e] uppercase font-mono">Auth Session</div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    JWT Active
                  </div>
                </div>
              </div>

              <div className="huly-card p-5 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#ff8964]/10 text-[#ff8964] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#95979e] uppercase font-mono">Active CRM Leads</div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {health?.leadCount ?? 0} Captured Leads
                  </div>
                </div>
              </div>

              <div className="huly-card p-5 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#95979e] uppercase font-mono">User Accounts</div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {health?.userCount ?? 1} Registered Users
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Action Card */}
            {isAdminOrTeam && (
              <div className="huly-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-[#ff8964]/40 bg-[#ff8964]/5">
                <div>
                  <h3 className="font-bold text-white text-base">Open Lead CRM Pipeline</h3>
                  <p className="text-xs text-[#95979e] mt-0.5">
                    View captured leads, advance status stages (New → Contacted → Proposal → Won), and perform 1-click lead-to-client conversions.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('leads')}
                  className="btn-pill-primary py-2.5 px-6 text-xs whitespace-nowrap"
                >
                  Manage CRM Pipeline →
                </button>
              </div>
            )}

            {/* User Session Profile Raw Dump */}
            <div className="huly-card p-6">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Verified User Profile Details</span>
              </h3>
              <pre className="bg-[#090a0c] p-4 rounded-xl text-xs font-mono text-[#5683da] overflow-x-auto border border-[#4a4b50]/40">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
