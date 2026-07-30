import React, { useEffect, useState } from 'react';
import { Client, User } from '../../types';
import { fetchWithAuth } from '../../services/api';
import { 
  Building, 
  Plus, 
  Search, 
  Calendar, 
  Phone, 
  Mail, 
  Briefcase, 
  FileText, 
  LifeBuoy, 
  Edit3, 
  Trash2, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface ExtendedClient extends Client {
  user: User;
  _count: {
    projects: number;
    invoices: number;
    tickets: number;
    documents: number;
  };
}

export const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<ExtendedClient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [editClient, setEditClient] = useState<ExtendedClient | null>(null);

  // New Client Form State
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    address: '',
    renewalDate: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth<{ clients: ExtendedClient[] }>('/clients');
      setClients(res.clients);
    } catch (err: any) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = await fetchWithAuth<any>('/clients', {
        method: 'POST',
        body: JSON.stringify(newClient),
      });

      setCreatedCredentials(data);
      setShowAddModal(false);
      setNewClient({
        name: '',
        email: '',
        companyName: '',
        phone: '',
        address: '',
        renewalDate: '',
      });
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClient) return;

    try {
      await fetchWithAuth(`/clients/${editClient.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          companyName: editClient.companyName,
          phone: editClient.phone,
          address: editClient.address,
          renewalDate: editClient.renewalDate,
        }),
      });

      setEditClient(null);
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Failed to update client');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client account and user login?')) return;

    try {
      await fetchWithAuth(`/clients/${clientId}`, {
        method: 'DELETE',
      });
      setSelectedClient(null);
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Failed to delete client');
    }
  };

  const viewClientDetails = async (clientId: string) => {
    try {
      const res = await fetchWithAuth<{ client: any }>(`/clients/${clientId}`);
      setSelectedClient(res.client);
    } catch (err: any) {
      alert(err.message || 'Failed to load client details');
    }
  };

  const filteredClients = clients.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.user.name.toLowerCase().includes(search.toLowerCase()) ||
    c.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getDaysUntilRenewal = (dateStr: string) => {
    const renewal = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((renewal - now) / (1000 * 3600 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964] font-mono text-[10px] uppercase">Client Directory</span>
            <span className="text-xs text-[#95979e] font-mono">{clients.length} Active Agency Clients</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Client Accounts & Renewals</h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="huly-input pl-10"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Client Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-3 huly-card p-12 text-center text-[#95979e]">
            No client accounts found. Convert a lead or add a new client to get started.
          </div>
        ) : (
          filteredClients.map(client => {
            const daysLeft = getDaysUntilRenewal(client.renewalDate);
            const isRenewalSoon = daysLeft <= 30;

            return (
              <div key={client.id} className="huly-card p-6 flex flex-col justify-between space-y-4 relative group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center font-bold">
                      <Building className="w-5 h-5" />
                    </div>

                    {isRenewalSoon ? (
                      <span className="tag-pill bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center space-x-1 text-[10px]">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Renewal in {daysLeft} Days</span>
                      </span>
                    ) : (
                      <span className="tag-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                        Active SLA
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#5683da] transition-colors">
                      {client.companyName}
                    </h3>
                    <p className="text-xs text-[#95979e]">{client.user.name}</p>
                  </div>

                  <div className="space-y-1 text-xs text-[#95979e]">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-[#5683da]" />
                      <span className="truncate">{client.user.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-[#ff8964]" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-[11px] font-mono pt-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Renewal: {new Date(client.renewalDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Counts Bar */}
                <div className="pt-3 border-t border-[#4a4b50]/40 grid grid-cols-3 gap-2 text-center text-[10px] text-[#95979e] font-mono">
                  <div className="bg-[#090a0c] p-2 rounded-lg border border-[#4a4b50]/40">
                    <span className="text-white font-bold block text-sm">{client._count.projects}</span>
                    <span>Projects</span>
                  </div>
                  <div className="bg-[#090a0c] p-2 rounded-lg border border-[#4a4b50]/40">
                    <span className="text-white font-bold block text-sm">{client._count.invoices}</span>
                    <span>Invoices</span>
                  </div>
                  <div className="bg-[#090a0c] p-2 rounded-lg border border-[#4a4b50]/40">
                    <span className="text-white font-bold block text-sm">{client._count.tickets}</span>
                    <span>Tickets</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => viewClientDetails(client.id)}
                    className="btn-pill-secondary flex-1 py-2 text-xs text-center"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => setEditClient(client)}
                    className="btn-pill-secondary p-2 text-xs text-[#5683da]"
                    title="Edit Client"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="btn-pill-secondary p-2 text-xs text-red-400"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Client Full Profile Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-2xl w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ff8964]/10 text-[#ff8964] flex items-center justify-center font-bold text-xl">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedClient.companyName}</h3>
                <p className="text-xs text-[#95979e]">{selectedClient.user.name} • {selectedClient.user.email}</p>
                <span className="tag-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] mt-2 inline-block font-mono">
                  Renewal Date: {new Date(selectedClient.renewalDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Sub-tabs: Projects, Invoices, Tickets */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-[#95979e] tracking-wider">Associated Client Projects ({selectedClient.projects?.length || 0})</h4>
              <div className="space-y-2">
                {selectedClient.projects?.length === 0 ? (
                  <div className="p-4 bg-[#090a0c] rounded-xl text-xs text-[#95979e] text-center border border-[#4a4b50]/30">No active projects assigned yet.</div>
                ) : (
                  selectedClient.projects?.map((proj: any) => (
                    <div key={proj.id} className="p-3 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{proj.projectName}</span>
                        <span className="text-[#95979e] text-[10px]">{proj.description}</span>
                      </div>
                      <span className="tag-pill bg-[#5683da]/20 text-[#5683da]">{proj.status}</span>
                    </div>
                  ))
                )}
              </div>

              <h4 className="text-xs font-mono uppercase text-[#95979e] tracking-wider pt-2">Client Invoices ({selectedClient.invoices?.length || 0})</h4>
              <div className="space-y-2">
                {selectedClient.invoices?.length === 0 ? (
                  <div className="p-4 bg-[#090a0c] rounded-xl text-xs text-[#95979e] text-center border border-[#4a4b50]/30">No invoices issued yet.</div>
                ) : (
                  selectedClient.invoices?.map((inv: any) => (
                    <div key={inv.id} className="p-3 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-white block">{inv.invoiceNumber}</span>
                        <span className="text-emerald-400">${inv.amount}</span>
                      </div>
                      <span className="tag-pill bg-amber-500/20 text-amber-400">{inv.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#4a4b50]/40 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="btn-pill-secondary py-2 px-6 text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Client Profile */}
      {editClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setEditClient(null)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Edit Client Details</h3>

            <form onSubmit={handleUpdateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  value={editClient.companyName}
                  onChange={(e) => setEditClient({ ...editClient, companyName: e.target.value })}
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Phone / Mobile</label>
                <input
                  type="text"
                  value={editClient.phone}
                  onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Office Address</label>
                <input
                  type="text"
                  value={editClient.address}
                  onChange={(e) => setEditClient({ ...editClient, address: e.target.value })}
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Renewal Date</label>
                <input
                  type="date"
                  value={editClient.renewalDate ? new Date(editClient.renewalDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditClient({ ...editClient, renewalDate: e.target.value })}
                  className="huly-input font-mono"
                />
              </div>

              <button
                type="submit"
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                Save Client Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manual Add Client */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Add New Client Account</h3>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Client Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Robert Taylor"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Login Email Address *</label>
                <input
                  type="email"
                  required
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="robert@company.com"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  value={newClient.companyName}
                  onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                  placeholder="Taylor Financials"
                  className="huly-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#95979e] mb-1">Phone</label>
                  <input
                    type="text"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="+1 555-0192"
                    className="huly-input"
                  />
                </div>
                <div>
                  <label className="block text-[#95979e] mb-1">Renewal Date</label>
                  <input
                    type="date"
                    value={newClient.renewalDate}
                    onChange={(e) => setNewClient({ ...newClient, renewalDate: e.target.value })}
                    className="huly-input font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                {submitting ? 'Creating Client...' : 'Create Client Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Created Result */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 text-center space-y-4 relative border-emerald-500/50">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Client Account Ready</h3>
            <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/40 text-left text-xs font-mono space-y-2">
              <div className="text-[#95979e]">Login Email: <span className="text-white">{createdCredentials.userCredentials.email}</span></div>
              <div className="text-[#95979e]">Temp Password: <span className="text-emerald-400 font-bold">{createdCredentials.userCredentials.temporaryPassword}</span></div>
            </div>
            <button
              onClick={() => setCreatedCredentials(null)}
              className="btn-pill-primary w-full py-2 text-xs bg-emerald-600 hover:bg-emerald-500"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
