import React, { useEffect, useState, useCallback } from 'react';
import { supabase, subscribeToRealtimeTable } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { OrbLoader } from '../OrbLoader';
import {
  Building, Briefcase, FileText, LifeBuoy, FolderCheck, Calendar,
  CheckCircle2, Clock, Download, Printer, Plus, X, Sparkles,
  ShieldCheck, Globe, RefreshCw, AlertCircle, IndianRupee
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface PaymentItem { id: string; amount: number; payment_date: string; }

interface PortalData {
  client: {
    id: string; companyName: string; phone: string; address: string;
    renewalDate: string; user: { name: string; email: string };
    projects: any[]; invoices: any[]; tickets: any[]; documents: any[];
  };
  metrics: {
    totalInvoiced: number; totalCollected: number; pendingBalance: number;
    activeProjects: number; openTickets: number; totalDocuments: number;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export const ClientPortal: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'invoices' | 'documents' | 'tickets'>('overview');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // ─── Load Portal Data (Direct Supabase) ────────────────────────────────
  const loadPortalData = useCallback(async (silent = false) => {
    if (!user) return;
    try {
      if (!silent) setLoading(true); else setRefreshing(true);

      const cleanEmail = user.email?.toLowerCase().trim() || '';

      // Resolve client identity from both tables
      const [{ data: portalClient }, { data: supaClient }] = await Promise.all([
        supabase.from('portal_clients').select('*').eq('email', cleanEmail).maybeSingle(),
        supabase.from('clients').select('*, user:users(*)').eq('user_id', user.id).maybeSingle(),
      ]);

      const resolvedName = portalClient?.name || supaClient?.user?.name || user.name || 'Client';
      const resolvedEmail = portalClient?.email || supaClient?.user?.email || user.email || '';
      const resolvedCompany = portalClient?.company_name || supaClient?.company_name || `${resolvedName}'s Business`;
      const resolvedPhone = portalClient?.phone || supaClient?.phone || '';
      // Use clients.id for FK lookups (not portal_clients.id or user.id)
      const resolvedClientId = supaClient?.id || portalClient?.id || user.id;

      // Parallel fetch all client data
      const [
        { data: projects },
        { data: invoices },
        { data: tickets },
        { data: documents },
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('client_id', resolvedClientId).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*, payments(*)').eq('client_id', resolvedClientId).order('created_at', { ascending: false }),
        supabase.from('tickets').select('*').eq('client_id', resolvedClientId).order('created_at', { ascending: false }),
        supabase.from('documents').select('*').eq('client_id', resolvedClientId).order('created_at', { ascending: false }),
      ]);

      const projectsList = (projects || []).map((p: any) => ({
        id: p.id,
        projectName: p.project_name || p.projectName || 'Project',
        description: p.description || '',
        status: p.status || 'PLANNING',
        deliveryDate: p.delivery_date || p.deliveryDate || new Date().toISOString(),
        createdAt: p.created_at,
      }));

      const invoicesList = (invoices || []).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number || inv.invoiceNumber || '—',
        amount: parseFloat(inv.amount) || 0,
        status: inv.status || 'PENDING',
        createdAt: inv.created_at,
        payments: Array.isArray(inv.payments) ? inv.payments : [],
      }));

      const ticketsList = (tickets || []).map((t: any) => ({
        id: t.id,
        subject: t.subject || '',
        message: t.message || '',
        status: t.status || 'OPEN',
        createdAt: t.created_at,
      }));

      const documentsList = (documents || []).map((d: any) => ({
        id: d.id,
        fileName: d.file_name || d.fileName || 'Document',
        fileUrl: d.file_url || d.fileUrl || '',
        createdAt: d.created_at,
      }));

      // Compute financial metrics from actual payments table
      const totalInvoiced = invoicesList.reduce((s: number, inv: any) => s + inv.amount, 0);
      const totalCollected = invoicesList.reduce((s: number, inv: any) =>
        s + (Array.isArray(inv.payments) ? inv.payments.reduce((ps: number, p: any) => ps + (parseFloat(p.amount) || 0), 0) : 0), 0);
      const pendingBalance = Math.max(0, totalInvoiced - totalCollected);

      setData({
        client: {
          id: resolvedClientId,
          companyName: resolvedCompany,
          phone: resolvedPhone,
          address: supaClient?.address || 'PlatePixel Client Workspace',
          renewalDate: supaClient?.renewal_date || new Date(Date.now() + 365 * 86400000).toISOString(),
          user: { name: resolvedName, email: resolvedEmail },
          projects: projectsList,
          invoices: invoicesList,
          tickets: ticketsList,
          documents: documentsList,
        },
        metrics: {
          totalInvoiced,
          totalCollected,
          pendingBalance,
          activeProjects: projectsList.filter((p: any) => p.status !== 'DELIVERED').length,
          openTickets: ticketsList.filter((t: any) => t.status !== 'CLOSED').length,
          totalDocuments: documentsList.length,
        },
      });
      setLastSync(new Date());
    } catch (err: any) {
      console.error('[ClientPortal] loadPortalData error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadPortalData();

    // Realtime subscriptions — refresh portal on any changes
    const subs = [
      subscribeToRealtimeTable('projects', () => loadPortalData(true)),
      subscribeToRealtimeTable('invoices', () => loadPortalData(true)),
      subscribeToRealtimeTable('tickets', () => loadPortalData(true)),
      subscribeToRealtimeTable('documents', () => loadPortalData(true)),
      subscribeToRealtimeTable('payments', () => loadPortalData(true)),
    ];
    const intervalId = setInterval(() => loadPortalData(true), 15000);

    return () => {
      subs.forEach(s => s.unsubscribe());
      clearInterval(intervalId);
    };
  }, [loadPortalData]);

  // ─── Create Support Ticket (Direct Supabase) ────────────────────────────
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.client.id) return;
    setSubmittingTicket(true);
    setTicketError(null);

    try {
      const { error } = await supabase.from('tickets').insert({
        client_id: data.client.id,
        subject: newTicket.subject.trim(),
        message: newTicket.message.trim(),
        status: 'OPEN',
      });
      if (error) throw new Error(error.message);

      setTicketSuccess(true);
      setNewTicket({ subject: '', message: '' });
      setTimeout(() => {
        setTicketSuccess(false);
        setShowTicketModal(false);
      }, 2000);
      await loadPortalData(true);
    } catch (err: any) {
      setTicketError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // ─── Print Invoice ───────────────────────────────────────────────────────
  const handlePrintInvoice = (inv: any) => {
    const printWin = window.open('', '_blank', 'width=700,height=900');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #111; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #5683da; padding-bottom: 20px; margin-bottom: 24px; }
        .brand { font-size: 22px; font-weight: 900; color: #5683da; }
        .inv-num { font-size: 20px; font-weight: 900; color: #5683da; font-family: monospace; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f1f3f9; padding: 10px 14px; text-align: left; font-size: 10px; text-transform: uppercase; }
        td { padding: 12px 14px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        .total { font-size: 18px; font-weight: 900; color: #5683da; }
        .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 10px; color: #888; }
      </style></head><body>
      <div class="header">
        <div><div class="brand">🟠 PlatePixel Agency</div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px">Client Invoice</div></div>
        <div style="text-align:right"><div class="inv-num">${inv.invoiceNumber}</div><div style="font-size:11px;margin-top:4px;color:${inv.status === 'PAID' ? '#059669' : '#d97706'};font-weight:700">${inv.status}</div></div>
      </div>
      <div class="grid">
        <div><div style="font-size:9px;color:#888;text-transform:uppercase;margin-bottom:4px">Billed To</div>
          <div style="font-weight:700">${data?.client.companyName}</div>
          <div style="font-size:11px;color:#555">${data?.client.user.name}</div>
          <div style="font-size:11px;color:#555">${data?.client.user.email}</div>
        </div>
        <div style="text-align:right"><div style="font-size:9px;color:#888;text-transform:uppercase;margin-bottom:4px">Issue Date</div>
          <div style="font-weight:600">${new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
      <table>
        <thead><tr><th style="width:70%">Description</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          <tr><td><strong>Digital Agency Web Services</strong><br><span style="color:#666;font-size:11px">Website development, hosting & maintenance</span></td><td style="text-align:right;font-weight:700;font-family:monospace">₹${inv.amount.toLocaleString('en-IN')}</td></tr>
        </tbody>
        <tfoot>
          <tr><td style="text-align:right;color:#555">Total Due</td><td style="text-align:right" class="total">₹${inv.amount.toLocaleString('en-IN')}</td></tr>
        </tfoot>
      </table>
      <div class="footer"><div>PlatePixel Agency — Digital Excellence Platform</div><div>Generated: ${new Date().toLocaleString('en-IN')}</div></div>
      <script>window.onload=()=>window.print()</script></body></html>`);
    printWin.document.close();
  };

  if (loading) return <OrbLoader label="Loading your Client Workspace…" size="lg" />;

  if (!data) {
    return (
      <div className="huly-card p-10 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-[#5683da]/20 border border-[#5683da] flex items-center justify-center mx-auto mb-4 text-[#5683da]">
          <Building className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Setting Up Your Workspace</h3>
        <p className="text-sm text-[#95979e] mb-6">Click below to initialize your client portal.</p>
        <button onClick={() => loadPortalData()} className="btn-pill-primary text-sm py-2.5 px-6">Initialize Workspace</button>
      </div>
    );
  }

  const { client, metrics } = data;
  const renewalDays = Math.ceil((new Date(client.renewalDate).getTime() - Date.now()) / 86400000);

  const getProjectBadge = (s: string) => ({
    PLANNING: <span className="tag-pill bg-blue-500/20 text-blue-400">PLANNING</span>,
    DEVELOPMENT: <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964]">DEVELOPMENT</span>,
    TESTING: <span className="tag-pill bg-purple-500/20 text-purple-400">TESTING</span>,
    DELIVERED: <span className="tag-pill bg-emerald-500/20 text-emerald-400">LIVE ✓</span>,
  }[s] || <span className="tag-pill bg-gray-500/20 text-gray-400">{s}</span>);

  const getInvoiceBadge = (s: string) => ({
    PAID: <span className="tag-pill bg-emerald-500/20 text-emerald-400">PAID</span>,
    PENDING: <span className="tag-pill bg-amber-500/20 text-amber-400">PENDING</span>,
    OVERDUE: <span className="tag-pill bg-red-500/20 text-red-400">OVERDUE</span>,
  }[s] || <span className="tag-pill bg-gray-500/20 text-gray-400">{s}</span>);

  const getTicketBadge = (s: string) => ({
    OPEN: <span className="tag-pill bg-amber-500/20 text-amber-400">OPEN</span>,
    IN_PROGRESS: <span className="tag-pill bg-[#5683da]/20 text-[#5683da]">IN PROGRESS</span>,
    CLOSED: <span className="tag-pill bg-emerald-500/20 text-emerald-400">RESOLVED</span>,
  }[s] || <span className="tag-pill bg-gray-500/20 text-gray-400">{s}</span>);

  return (
    <div className="space-y-8">

      {/* ── Welcome Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111111] via-[#151a26] to-[#111111] border border-[#5683da]/40 p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#5683da]/20 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="tag-pill bg-[#5683da]/20 text-[#5683da] border border-[#5683da]/30 flex items-center space-x-1">
                <Globe className="w-3 h-3 text-[#ff8964]" /><span>Client Portal Active</span>
              </span>
              <span className="text-xs text-[#95979e] font-mono">{client.companyName}</span>
              {refreshing && <RefreshCw className="w-3 h-3 text-[#5683da] animate-spin" />}
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, {client.user.name} 👋</h1>
            <p className="text-sm text-[#95979e] mt-1">Last updated: {lastSync.toLocaleTimeString('en-IN')}</p>
          </div>

          <div className="flex flex-col space-y-2">
            {/* Renewal status */}
            <div className="huly-card px-5 py-3 border-emerald-500/40 bg-emerald-500/5 text-right">
              <div className="text-[10px] text-[#95979e] uppercase font-mono">Domain & Hosting Renewal</div>
              <div className={`text-sm font-bold flex items-center justify-end space-x-1 mt-0.5 font-mono ${renewalDays <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                <Calendar className="w-4 h-4" />
                <span>{new Date(client.renewalDate).toLocaleDateString('en-IN')} ({renewalDays}d)</span>
              </div>
            </div>
            {/* Refresh button */}
            <button
              onClick={() => loadPortalData(true)}
              className="btn-pill-secondary py-1.5 px-3 text-xs flex items-center justify-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center space-x-3 border-b border-[#4a4b50]/40 pb-4 overflow-x-auto">
        {[
          { key: 'overview', icon: <Building className="w-4 h-4" />, label: 'Dashboard', count: null },
          { key: 'projects', icon: <Briefcase className="w-4 h-4 text-[#ff8964]" />, label: 'My Projects', count: client.projects.length, color: 'bg-[#ff8964]' },
          { key: 'invoices', icon: <FileText className="w-4 h-4 text-emerald-400" />, label: 'Invoices', count: client.invoices.length, color: 'bg-emerald-400' },
          { key: 'documents', icon: <FolderCheck className="w-4 h-4 text-purple-400" />, label: 'Documents', count: client.documents.length, color: 'bg-purple-400' },
          { key: 'tickets', icon: <LifeBuoy className="w-4 h-4 text-amber-400" />, label: 'Support Tickets', count: client.tickets.length, color: 'bg-amber-400' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
                : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`w-5 h-5 rounded-full ${tab.color} text-black text-[10px] font-bold flex items-center justify-center`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          TAB: OVERVIEW DASHBOARD
         ══════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid — 4 cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Website Status */}
            <div className="huly-card p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#95979e] uppercase font-mono">Website Status</div>
                <div className="text-sm font-semibold text-emerald-400 flex items-center space-x-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active & Secure</span>
                </div>
              </div>
            </div>

            {/* Active Projects — from DB */}
            <div className="huly-card p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#95979e] uppercase font-mono">Active Projects</div>
                <div className="text-2xl font-extrabold text-white mt-0.5">{metrics.activeProjects}</div>
                <div className="text-[10px] text-[#95979e]">In Progress</div>
              </div>
            </div>

            {/* Pending Invoices — ₹ INR from DB payments */}
            <div className="huly-card p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#95979e] uppercase font-mono">Pending Balance</div>
                <div className="text-xl font-extrabold text-amber-400 mt-0.5 font-mono">
                  ₹{metrics.pendingBalance.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#95979e]">Outstanding</div>
              </div>
            </div>

            {/* Project Files — from DB */}
            <div className="huly-card p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FolderCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#95979e] uppercase font-mono">Project Files</div>
                <div className="text-2xl font-extrabold text-white mt-0.5">{metrics.totalDocuments}</div>
                <div className="text-[10px] text-[#95979e]">Uploaded</div>
              </div>
            </div>
          </div>

          {/* Quick Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Projects Card */}
            <div className="huly-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-[#ff8964]" /><span>Active & Delivered Web Projects</span>
                </h3>
                <button onClick={() => setActiveTab('projects')} className="text-xs text-[#5683da] hover:underline font-mono">
                  View All ({client.projects.length}) →
                </button>
              </div>
              {client.projects.length === 0 ? (
                <div className="p-6 bg-[#090a0c] rounded-xl text-xs text-[#95979e] text-center border border-[#4a4b50]/30">
                  No web projects assigned yet. Contact us to start a new site build.
                </div>
              ) : (
                client.projects.slice(0, 3).map((p: any) => (
                  <div key={p.id} className="p-4 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{p.projectName}</span>
                      {getProjectBadge(p.status)}
                    </div>
                    <p className="text-[11px] text-[#95979e] line-clamp-1">{p.description}</p>
                    <div className="text-[10px] text-emerald-400 font-mono pt-1">
                      Delivery: {new Date(p.deliveryDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Invoices Card */}
            <div className="huly-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" /><span>Invoices & Payment History</span>
                </h3>
                <button onClick={() => setActiveTab('invoices')} className="text-xs text-[#5683da] hover:underline font-mono">
                  View All ({client.invoices.length}) →
                </button>
              </div>
              {/* Financial summary */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#090a0c] p-3 rounded-xl border border-[#4a4b50]/40">
                  <div className="text-[#95979e] text-[10px] uppercase font-mono">Total Invoiced</div>
                  <div className="text-white font-bold font-mono text-sm mt-0.5">₹{metrics.totalInvoiced.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-[#090a0c] p-3 rounded-xl border border-emerald-500/20">
                  <div className="text-[#95979e] text-[10px] uppercase font-mono">Collected</div>
                  <div className="text-emerald-400 font-bold font-mono text-sm mt-0.5">₹{metrics.totalCollected.toLocaleString('en-IN')}</div>
                </div>
              </div>
              {client.invoices.length === 0 ? (
                <div className="p-4 bg-[#090a0c] rounded-xl text-xs text-[#95979e] text-center border border-[#4a4b50]/30">No invoices yet.</div>
              ) : (
                client.invoices.slice(0, 2).map((inv: any) => (
                  <div key={inv.id} className="p-3 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-white block">{inv.invoiceNumber}</span>
                      <span className="text-[#95979e] text-[10px]">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white block">₹{inv.amount.toLocaleString('en-IN')}</span>
                      {getInvoiceBadge(inv.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Support Tickets Quick View */}
          <div className="huly-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <LifeBuoy className="w-4 h-4 text-amber-400" /><span>Support & Service Tickets</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setTicketError(null); setTicketSuccess(false); setShowTicketModal(true); }}
                  className="btn-pill-primary text-xs py-1.5 px-3 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" /><span>Open Ticket</span>
                </button>
                <button onClick={() => setActiveTab('tickets')} className="text-xs text-[#5683da] hover:underline font-mono">
                  All ({client.tickets.length}) →
                </button>
              </div>
            </div>
            {client.tickets.slice(0, 2).map((t: any) => (
              <div key={t.id} className="p-3 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{t.subject}</span>
                  <span className="text-[#95979e] text-[10px] font-mono">{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {getTicketBadge(t.status)}
              </div>
            ))}
            {client.tickets.length === 0 && (
              <div className="p-6 bg-[#090a0c] rounded-xl text-xs text-[#95979e] text-center border border-[#4a4b50]/30">
                No support tickets yet.{' '}
                <button onClick={() => setShowTicketModal(true)} className="text-[#5683da] underline">Open one now →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: PROJECTS
         ══════════════════════════════ */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Active &amp; Delivered Web Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {client.projects.length === 0 ? (
              <div className="col-span-2 huly-card p-12 text-center text-[#95979e]">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No projects assigned yet. Contact your agency manager.
              </div>
            ) : (
              client.projects.map((p: any) => (
                <div key={p.id} className="huly-card p-6 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-base text-white">{p.projectName}</h4>
                      {getProjectBadge(p.status)}
                    </div>
                    <p className="text-xs text-[#95979e] leading-relaxed">{p.description || 'No description provided.'}</p>
                  </div>
                  <div className="pt-3 border-t border-[#4a4b50]/40 flex justify-between items-center text-xs font-mono">
                    <span className="text-[#95979e]">Target Delivery</span>
                    <span className="text-emerald-400 font-bold">{new Date(p.deliveryDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: INVOICES
         ══════════════════════════════ */}
      {activeTab === 'invoices' && (
        <div className="huly-card overflow-hidden">
          <div className="p-6 border-b border-[#4a4b50]/40 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Invoices &amp; Payment History</h3>
            <div className="text-right text-xs font-mono space-y-0.5">
              <div className="text-emerald-400">Collected: ₹{metrics.totalCollected.toLocaleString('en-IN')}</div>
              <div className="text-amber-400">Pending: ₹{metrics.pendingBalance.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090a0c] text-[#95979e] uppercase font-mono border-b border-[#4a4b50]/60">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4a4b50]/40">
                {client.invoices.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-[#95979e]">No invoices issued yet.</td></tr>
                ) : (
                  client.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-[#090a0c]/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="p-4 text-[#95979e] font-mono">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="p-4 font-mono font-bold text-white">₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4">{getInvoiceBadge(inv.status)}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handlePrintInvoice(inv)} className="btn-pill-secondary py-1 px-4 text-[11px] flex items-center space-x-1 ml-auto">
                          <Printer className="w-3 h-3" /><span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: DOCUMENTS
         ══════════════════════════════ */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
            <div>
              <h3 className="text-xl font-bold text-white">Project Documents &amp; Assets</h3>
              <p className="text-xs text-[#95979e]">Download contract agreements, design assets uploaded by your agency.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {client.documents.length === 0 ? (
              <div className="col-span-3 huly-card p-12 text-center text-[#95979e]">
                <FolderCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No documents uploaded yet.
              </div>
            ) : (
              client.documents.map((doc: any) => (
                <div key={doc.id} className="huly-card p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl shrink-0">
                      <FolderCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white break-all">{doc.fileName}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="tag-pill bg-purple-500/20 text-purple-300 font-mono text-[9px]">Agreement</span>
                        <span className="text-[10px] text-[#95979e] font-mono">{new Date(doc.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                  <a href={doc.fileUrl} target="_blank" download rel="noreferrer"
                    className="btn-pill-secondary w-full py-2 text-xs text-center flex items-center justify-center space-x-1.5 text-[#5683da]">
                    <Download className="w-3.5 h-3.5" /><span>Download File</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: SUPPORT TICKETS
         ══════════════════════════════ */}
      {activeTab === 'tickets' && (
        <div className="huly-card p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-[#4a4b50]/40 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Support &amp; Service Tickets</h3>
              <p className="text-xs text-[#95979e]">Submit requests for content edits, tech support, or domain help.</p>
            </div>
            <button
              onClick={() => { setTicketError(null); setTicketSuccess(false); setShowTicketModal(true); }}
              className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" /><span>Open Support Ticket</span>
            </button>
          </div>
          <div className="space-y-3">
            {client.tickets.length === 0 ? (
              <div className="p-10 bg-[#090a0c] rounded-xl text-xs text-[#95979e] text-center border border-[#4a4b50]/30">
                <LifeBuoy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No support tickets yet.{' '}
                <button onClick={() => setShowTicketModal(true)} className="text-[#5683da] underline">Open your first ticket →</button>
              </div>
            ) : (
              client.tickets.map((t: any) => (
                <div key={t.id} className="p-4 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">{t.subject}</span>
                    <span className="text-[#95979e] text-[11px] block mt-0.5 line-clamp-1">{t.message}</span>
                    <span className="text-[10px] text-[#95979e] font-mono mt-1 block">{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {getTicketBadge(t.status)}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          MODAL: Open Support Ticket
         ══════════════════════════════ */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative border-amber-500/40">
            <button onClick={() => setShowTicketModal(false)} className="absolute top-4 right-4 text-[#95979e] hover:text-white"><X className="w-5 h-5" /></button>

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Open Support Ticket</h3>
                <p className="text-[10px] text-[#95979e]">Submitted directly to Supabase → realtime</p>
              </div>
            </div>

            {ticketSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" /><span>Ticket submitted successfully! ✓</span>
              </div>
            )}
            {ticketError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" /><span>{ticketError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Ticket Subject / Title *</label>
                <input
                  type="text" required value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. Menu price update, SSL issue, website edit..."
                  className="huly-input"
                />
              </div>
              <div>
                <label className="block text-[#95979e] mb-1">Detailed Request / Message *</label>
                <textarea
                  rows={4} required value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe the update or support needed in detail..."
                  className="huly-input resize-none"
                />
              </div>
              <button type="submit" disabled={submittingTicket}
                className="btn-pill-primary w-full py-2.5 text-xs flex items-center justify-center space-x-2">
                {submittingTicket ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{submittingTicket ? 'Submitting…' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
