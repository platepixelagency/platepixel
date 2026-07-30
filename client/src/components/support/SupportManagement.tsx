import React, { useEffect, useState } from 'react';
import { Ticket, Client } from '../../types';
import { fetchWithAuth } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Building, 
  CheckCircle2, 
  Clock, 
  X, 
  Trash2, 
  MessageSquare,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface ExtendedTicket extends Ticket {
  client: {
    id: string;
    companyName: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export const SupportManagement: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ExtendedTicket[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<ExtendedTicket | null>(null);

  // Form State
  const [newTicket, setNewTicket] = useState({
    clientId: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const isAdminOrTeam = user?.role === 'ADMIN' || user?.role === 'TEAM_MEMBER';

  const loadData = async () => {
    try {
      setLoading(true);
      const [tickRes, clientRes] = await Promise.all([
        fetchWithAuth<{ tickets: ExtendedTicket[] }>('/tickets'),
        isAdminOrTeam ? fetchWithAuth<{ clients: any[] }>('/clients') : Promise.resolve({ clients: [] }),
      ]);
      setTickets(tickRes.tickets);
      setClients(clientRes.clients);
      if (clientRes.clients.length > 0 && !newTicket.clientId) {
        setNewTicket(prev => ({ ...prev, clientId: clientRes.clients[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load support tickets data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetchWithAuth('/tickets', {
        method: 'POST',
        body: JSON.stringify(newTicket),
      });

      setShowAddModal(false);
      setNewTicket({
        clientId: clients[0]?.id || '',
        subject: '',
        message: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to open support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await fetchWithAuth(`/tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await fetchWithAuth(`/tickets/${ticketId}`, {
        method: 'DELETE',
      });
      setSelectedTicket(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete ticket');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase()) ||
      t.client.companyName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="tag-pill bg-amber-500/20 text-amber-400 border border-amber-500/30">OPEN</span>;
      case 'IN_PROGRESS':
        return <span className="tag-pill bg-[#5683da]/20 text-[#5683da] border border-[#5683da]/30">IN PROGRESS</span>;
      case 'CLOSED':
        return <span className="tag-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">RESOLVED / CLOSED</span>;
      default:
        return <span className="tag-pill bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="tag-pill bg-amber-500/20 text-amber-400 font-mono text-[10px] uppercase">Support Engine</span>
            <span className="text-xs text-[#95979e] font-mono">{tickets.length} Support Tickets Logged</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Support & Helpdesk Tickets</h2>
        </div>

        <div className="flex items-center space-x-3">
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
            onClick={() => setShowAddModal(true)}
            className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Open Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`tag-pill text-xs py-1.5 px-3 transition-all ${
              statusFilter === st
                ? 'bg-[#5683da] text-white font-semibold'
                : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Ticket List Data Table */}
      <div className="huly-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090a0c] text-[#95979e] uppercase font-mono border-b border-[#4a4b50]/60">
              <tr>
                <th className="p-4">Subject / Issue</th>
                <th className="p-4">Client Company</th>
                <th className="p-4">Logged Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4a4b50]/40">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#95979e]">
                    No support tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => (
                  <tr key={t.id} className="hover:bg-[#090a0c]/50 transition-colors">
                    <td className="p-4 font-bold text-white max-w-xs truncate">{t.subject}</td>
                    <td className="p-4 text-[#ff8964] font-medium">
                      {t.client.companyName}
                      <span className="block text-[10px] text-[#95979e] font-normal">{t.client.user.name}</span>
                    </td>
                    <td className="p-4 font-mono text-[#95979e]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">{getStatusBadge(t.status)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="btn-pill-secondary py-1 px-3 text-[11px]"
                      >
                        Inspect Ticket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Ticket Inspection Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-lg w-full p-6 md:p-8 space-y-6 relative border-amber-500/50">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white">{selectedTicket.subject}</h3>
                </div>
                <p className="text-xs text-[#ff8964] font-medium">{selectedTicket.client.companyName} • {selectedTicket.client.user.email}</p>
                <div className="mt-2">{getStatusBadge(selectedTicket.status)}</div>
              </div>
            </div>

            <div>
              <span className="text-xs text-[#95979e] uppercase font-mono block mb-1">Issue Details / Inquiry Message</span>
              <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/40 text-xs text-white leading-relaxed">
                {selectedTicket.message}
              </div>
            </div>

            {/* Status Transition Controls */}
            {isAdminOrTeam && (
              <div>
                <label className="block text-xs font-mono text-[#95979e] uppercase mb-2">Update Ticket Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['OPEN', 'IN_PROGRESS', 'CLOSED'].map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                      className={`tag-pill text-xs py-2 text-center transition-all ${
                        selectedTicket.status === st
                          ? 'bg-[#5683da] text-white font-bold'
                          : 'bg-[#090a0c] border border-[#4a4b50] text-[#95979e] hover:border-[#5683da]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#4a4b50]/40 flex justify-between items-center">
              {isAdminOrTeam ? (
                <button
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  className="text-xs text-red-400 hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Ticket</span>
                </button>
              ) : <div></div>}

              <button
                onClick={() => setSelectedTicket(null)}
                className="btn-pill-primary py-2 px-6 text-xs"
              >
                Close Ticket View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Open Support Ticket */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Open Support Ticket</h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              {isAdminOrTeam && (
                <div>
                  <label className="block text-[#95979e] mb-1">Select Client *</label>
                  <select
                    value={newTicket.clientId}
                    onChange={(e) => setNewTicket({ ...newTicket, clientId: e.target.value })}
                    className="huly-input"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.user.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[#95979e] mb-1">Ticket Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Need monthly content update for menu"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Detailed Inquiry / Message *</label>
                <textarea
                  rows={4}
                  required
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Please describe the updates, bug fixes, or assistance needed..."
                  className="huly-input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                {submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
