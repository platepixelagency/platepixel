import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  Trash2,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Zap,
  PhoneCall,
  ChevronDown,
} from 'lucide-react';
import { supabase, subscribeToRealtimeTable } from '../../services/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ExtendedTicket {
  id: string;
  clientId: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    companyName: string;
    phone?: string;
    user: { name: string; email: string };
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export const SupportManagement: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ExtendedTicket[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ExtendedTicket | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusChanging, setStatusChanging] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [newTicket, setNewTicket] = useState({ clientId: '', subject: '', message: '' });

  const isAdminOrTeam = user?.role === 'ADMIN' || user?.role === 'TEAM_MEMBER';

  // ─── Load Tickets (Direct Supabase) ────────────────────────────────────
  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      // Build client lookup from both tables
      const [clientResult, portalResult] = await Promise.all([
        supabase.from('clients').select('id, company_name, phone, user:users(name, email)'),
        supabase.from('portal_clients').select('id, name, email, company_name, phone'),
      ]);

      const clientMap = new Map<string, any>();
      (clientResult.data || []).forEach((c: any) =>
        clientMap.set(c.id, {
          id: c.id,
          companyName: c.company_name,
          phone: c.phone || '',
          user: c.user || { name: c.company_name, email: '' },
        })
      );
      (portalResult.data || []).forEach((pc: any) => {
        if (!clientMap.has(pc.id))
          clientMap.set(pc.id, {
            id: pc.id,
            companyName: pc.company_name || `${pc.name}'s Business`,
            phone: pc.phone || '',
            user: { name: pc.name, email: pc.email },
          });
      });

      const allClients = Array.from(clientMap.values());
      setClients(allClients);

      // Load tickets
      const { data: tickData, error: tickErr } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (tickErr) throw new Error(tickErr.message);

      const mapped: ExtendedTicket[] = (tickData || []).map((t: any) => ({
        id: t.id,
        clientId: t.client_id,
        subject: t.subject || '',
        message: t.message || '',
        status: t.status || 'OPEN',
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        client: clientMap.get(t.client_id) || {
          id: t.client_id,
          companyName: 'Unknown Client',
          phone: '',
          user: { name: 'Client', email: '' },
        },
      }));

      setTickets(mapped);
      setLastSync(new Date());

      // Set default clientId for new ticket form
      if (allClients.length > 0 && !newTicket.clientId) {
        setNewTicket(prev => ({ ...prev, clientId: allClients[0].id }));
      }
    } catch (err: any) {
      console.error('[Support] loadData error:', err);
      setError('Failed to load tickets. ' + err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const sub = subscribeToRealtimeTable('tickets', () => loadData(true));
    const intervalId = setInterval(() => loadData(true), 12000);
    return () => {
      sub.unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  // ─── Create Ticket (Direct Supabase) ────────────────────────────────────
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.clientId) { setError('Please select a client.'); return; }
    if (!newTicket.subject.trim()) { setError('Subject is required.'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertErr } = await supabase.from('tickets').insert({
        client_id: newTicket.clientId,
        subject: newTicket.subject.trim(),
        message: newTicket.message.trim(),
        status: 'OPEN',
      });
      if (insertErr) throw new Error(insertErr.message);

      setShowAddModal(false);
      setNewTicket({ clientId: clients[0]?.id || '', subject: '', message: '' });
      await loadData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Update Status (Direct Supabase) ────────────────────────────────────
  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setStatusChanging(ticketId + newStatus);
    try {
      const { error: upErr } = await supabase
        .from('tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      if (upErr) throw new Error(upErr.message);

      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      alert('Status update failed: ' + err.message);
    } finally {
      setStatusChanging(null);
    }
  };

  // ─── Delete Ticket (Direct Supabase) ────────────────────────────────────
  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Delete this support ticket permanently?')) return;
    try {
      const { error: delErr } = await supabase.from('tickets').delete().eq('id', ticketId);
      if (delErr) throw new Error(delErr.message);
      setSelectedTicket(null);
      await loadData(true);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // ─── WhatsApp Notification ───────────────────────────────────────────────
  const sendWhatsApp = (ticket: ExtendedTicket) => {
    const phone = ticket.client.phone?.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hello ${ticket.client.user.name}! 👋\n\nYour support ticket has been updated:\n\n📋 *Ticket:* ${ticket.subject}\n📊 *Status:* ${ticket.status}\n\nOur team is working on your request. We'll update you soon!\n\n— PlatePixel Agency`
    );
    if (phone && phone.length >= 10) {
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
  };

  // ─── Computed ────────────────────────────────────────────────────────────
  const filteredTickets = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.subject.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q) ||
      t.client.companyName.toLowerCase().includes(q) ||
      t.client.user.name.toLowerCase().includes(q);
    return matchesSearch && (statusFilter === 'ALL' || t.status === statusFilter);
  });

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const closedCount = tickets.filter(t => t.status === 'CLOSED').length;

  // ─── Status Badge ─────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="tag-pill bg-amber-500/20 text-amber-400 border border-amber-500/30">OPEN</span>;
      case 'IN_PROGRESS':
        return <span className="tag-pill bg-[#5683da]/20 text-[#5683da] border border-[#5683da]/30">IN PROGRESS</span>;
      case 'CLOSED':
        return <span className="tag-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">RESOLVED</span>;
      default:
        return <span className="tag-pill bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="huly-card p-5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#95979e] uppercase font-mono">Open</div>
            <div className="text-2xl font-extrabold text-amber-400">{openCount}</div>
          </div>
        </div>
        <div className="huly-card p-5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#95979e] uppercase font-mono">In Progress</div>
            <div className="text-2xl font-extrabold text-[#5683da]">{inProgressCount}</div>
          </div>
        </div>
        <div className="huly-card p-5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#95979e] uppercase font-mono">Resolved</div>
            <div className="text-2xl font-extrabold text-emerald-400">{closedCount}</div>
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="tag-pill bg-amber-500/20 text-amber-400 font-mono text-[10px] uppercase">Support Engine</span>
            <span className="text-xs text-[#95979e] font-mono">{tickets.length} tickets</span>
            <span className="text-[10px] text-[#95979e]/50 font-mono">· {lastSync.toLocaleTimeString()}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Support &amp; Helpdesk Tickets</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => loadData()} className="w-9 h-9 rounded-xl bg-[#1c1d22] border border-[#4a4b50] flex items-center justify-center text-[#95979e] hover:text-white transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="huly-input huly-input-icon"
            />
          </div>
          <button
            onClick={() => { setError(null); setShowAddModal(true); }}
            className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Open Ticket</span>
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && !showAddModal && (
        <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Status Filters ── */}
      <div className="flex items-center space-x-2 flex-wrap gap-y-2">
        {[
          { key: 'ALL', label: 'All', count: tickets.length },
          { key: 'OPEN', label: 'Open', count: openCount },
          { key: 'IN_PROGRESS', label: 'In Progress', count: inProgressCount },
          { key: 'CLOSED', label: 'Resolved', count: closedCount },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`tag-pill text-xs py-1.5 px-3 transition-all ${
              statusFilter === f.key
                ? 'bg-[#5683da] text-white font-semibold'
                : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-60 text-[10px]">({f.count})</span>
          </button>
        ))}
      </div>

      {/* ── Ticket Table ── */}
      <div className="huly-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#95979e] text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#5683da]" />
            Loading tickets from Supabase…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090a0c] text-[#95979e] uppercase font-mono border-b border-[#4a4b50]/60">
                <tr>
                  <th className="p-4">Subject / Issue</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  {isAdminOrTeam && <th className="p-4">Quick Actions</th>}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4a4b50]/40">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={isAdminOrTeam ? 6 : 5} className="p-10 text-center text-[#95979e]">
                      <LifeBuoy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No tickets found.{' '}
                      <button onClick={() => setShowAddModal(true)} className="text-[#5683da] underline">
                        Create first ticket
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(t => (
                    <tr key={t.id} className="hover:bg-[#090a0c]/50 transition-colors">
                      <td className="p-4 font-bold text-white max-w-xs">
                        <span className="block truncate max-w-[220px]">{t.subject}</span>
                        <span className="block text-[10px] text-[#95979e] font-normal truncate max-w-[220px] mt-0.5">{t.message}</span>
                      </td>
                      <td className="p-4 text-[#ff8964] font-medium">
                        {t.client.companyName}
                        <span className="block text-[10px] text-[#95979e] font-normal">{t.client.user.name}</span>
                      </td>
                      <td className="p-4 font-mono text-[#95979e]">
                        {new Date(t.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-4">{getStatusBadge(t.status)}</td>

                      {/* Quick Status Buttons — Admin only */}
                      {isAdminOrTeam && (
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            {['OPEN', 'IN_PROGRESS', 'CLOSED'].map(s => {
                              const isActive = t.status === s;
                              const isBusy = statusChanging === t.id + s;
                              return (
                                <button
                                  key={s}
                                  onClick={() => !isActive && handleUpdateStatus(t.id, s)}
                                  disabled={isActive || !!statusChanging}
                                  title={s}
                                  className={`text-[9px] font-mono px-2 py-1 rounded-lg border transition-all whitespace-nowrap ${
                                    isActive
                                      ? s === 'OPEN'
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                                        : s === 'IN_PROGRESS'
                                        ? 'bg-[#5683da]/20 text-[#5683da] border-[#5683da]/40 font-bold'
                                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                                      : 'bg-transparent border-[#4a4b50] text-[#95979e] hover:text-white hover:border-[#5683da]'
                                  }`}
                                >
                                  {isBusy ? '…' : s === 'IN_PROGRESS' ? 'WIP' : s === 'CLOSED' ? '✓ DONE' : 'OPEN'}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      )}

                      <td className="p-4 text-right space-x-1">
                        {/* WhatsApp notify */}
                        <button
                          onClick={() => sendWhatsApp(t)}
                          className="btn-pill-secondary py-1 px-2 text-[11px] text-green-400 border-green-500/40 hover:bg-green-500/10 inline-flex items-center space-x-1"
                          title="Send WhatsApp Update"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>WA</span>
                        </button>
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="btn-pill-secondary py-1 px-3 text-[11px]"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL: Ticket Inspection
         ══════════════════════════════════════════════════════════ */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-lg w-full p-6 md:p-8 space-y-6 relative border-amber-500/50">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedTicket.subject}</h3>
                <p className="text-xs text-[#ff8964] font-medium">
                  {selectedTicket.client.companyName} · {selectedTicket.client.user.name}
                </p>
                <p className="text-[10px] text-[#95979e] font-mono mt-0.5">
                  Opened: {new Date(selectedTicket.createdAt).toLocaleString('en-IN')}
                </p>
                <div className="mt-2">{getStatusBadge(selectedTicket.status)}</div>
              </div>
            </div>

            {/* Message */}
            <div>
              <span className="text-xs text-[#95979e] uppercase font-mono block mb-1">Issue / Message</span>
              <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/40 text-xs text-white leading-relaxed">
                {selectedTicket.message}
              </div>
            </div>

            {/* Status Controls */}
            {isAdminOrTeam && (
              <div>
                <label className="block text-xs font-mono text-[#95979e] uppercase mb-2">Quick Status Update</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'OPEN', label: '🔴 Open', color: 'amber' },
                    { val: 'IN_PROGRESS', label: '🔵 In Progress', color: 'blue' },
                    { val: 'CLOSED', label: '✅ Resolved', color: 'emerald' },
                  ].map(s => (
                    <button
                      key={s.val}
                      onClick={() => handleUpdateStatus(selectedTicket.id, s.val)}
                      className={`tag-pill text-xs py-2.5 text-center transition-all font-medium ${
                        selectedTicket.status === s.val
                          ? 'bg-[#5683da] text-white font-bold border-[#5683da]'
                          : 'bg-[#090a0c] border border-[#4a4b50] text-[#95979e] hover:border-[#5683da] hover:text-white'
                      }`}
                    >
                      {statusChanging === selectedTicket.id + s.val ? '…' : s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp Notify Client */}
            <div className="bg-[#090a0c] p-4 rounded-xl border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-2">
                    <PhoneCall className="w-4 h-4 text-green-400" />
                    <span>Notify via WhatsApp</span>
                  </div>
                  <p className="text-[10px] text-[#95979e] mt-0.5">
                    Send status update to client's WhatsApp
                    {selectedTicket.client.phone ? ` (${selectedTicket.client.phone})` : ' (no phone on file)'}
                  </p>
                </div>
                <button
                  onClick={() => sendWhatsApp(selectedTicket)}
                  className="btn-pill-primary py-2 px-4 text-xs bg-green-600 hover:bg-green-500 flex items-center space-x-2"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Send WA</span>
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-[#4a4b50]/40 flex justify-between items-center">
              {isAdminOrTeam ? (
                <button
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  className="text-xs text-red-400 hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Ticket</span>
                </button>
              ) : <div />}
              <button onClick={() => setSelectedTicket(null)} className="btn-pill-primary py-2 px-6 text-xs">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: Create Ticket
         ══════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => { setShowAddModal(false); setError(null); }} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Open Support Ticket</h3>
                <p className="text-[10px] text-[#95979e]">Saved directly to Supabase → realtime</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              {/* Client Selector — always show (admin selects, client sees own) */}
              <div>
                <label className="block text-[#95979e] mb-1">Assign to Client *</label>
                {clients.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
                    No clients loaded. Please wait or refresh.
                  </div>
                ) : (
                  <select
                    value={newTicket.clientId}
                    onChange={(e) => setNewTicket({ ...newTicket, clientId: e.target.value })}
                    className="huly-input"
                    required
                  >
                    <option value="">— Select Client —</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.user?.name || c.user?.email || 'Client'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Ticket Subject *</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. Website not loading on mobile"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Detailed Message *</label>
                <textarea
                  rows={4}
                  required
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe the issue or request in detail…"
                  className="huly-input resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || clients.length === 0}
                className="btn-pill-primary w-full py-2.5 text-xs flex items-center justify-center space-x-2"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{submitting ? 'Creating Ticket…' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
