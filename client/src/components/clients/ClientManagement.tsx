import React, { useEffect, useState } from 'react';
import { Client, User } from '../../types';
import { fetchWithAuth } from '../../services/api';
import { supabase, subscribeToRealtimeTable } from '../../services/supabase';
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
  ShieldCheck,
  Upload,
  FolderPlus
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

  // Quick action modals for specific client
  const [invoiceModalClient, setInvoiceModalClient] = useState<ExtendedClient | null>(null);
  const [docModalClient, setDocModalClient] = useState<ExtendedClient | null>(null);

  // New Client Form State
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    address: '',
    renewalDate: '',
  });

  // Quick Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    amount: '499',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    description: 'Web development & retainer service fee',
  });

  // Quick Document Form State
  const [docForm, setDocForm] = useState({
    docType: 'Change Request Agreement (CRA)',
    fileName: 'Change Request Agreement (CRA).pdf',
    fileUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);

  const loadClients = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      let loadedClients: ExtendedClient[] = [];

      // 1. Primary API fetch
      try {
        const res = await fetchWithAuth<{ clients: ExtendedClient[] }>('/clients');
        if (res.clients && res.clients.length > 0) {
          loadedClients = res.clients;
        }
      } catch (e) {}

      // 2. Direct Supabase DB Fallback
      if (loadedClients.length === 0) {
        try {
          const { data: supaClients } = await supabase
            .from('clients')
            .select('*, user:users(*)');

          const { data: portalClients } = await supabase
            .from('portal_clients')
            .select('*');

          const combinedClientsMap = new Map<string, any>();

          if (supaClients && supaClients.length > 0) {
            supaClients.forEach((c: any) => {
              combinedClientsMap.set(c.id, {
                id: c.id,
                userId: c.user_id,
                companyName: c.company_name,
                phone: c.phone || '',
                address: c.address || '',
                renewalDate: c.renewal_date,
                user: c.user || { name: c.company_name, email: 'client@agency.com' },
                _count: { projects: 0, invoices: 0, tickets: 0, documents: 0 },
              });
            });
          }

          if (portalClients && portalClients.length > 0) {
            portalClients.forEach((pc: any) => {
              if (!combinedClientsMap.has(pc.id)) {
                combinedClientsMap.set(pc.id, {
                  id: pc.id,
                  userId: pc.id,
                  companyName: pc.company_name || `${pc.name}'s Business`,
                  phone: pc.phone || '',
                  address: 'PlatePixel Client Workspace',
                  renewalDate: new Date(Date.now() + 365 * 86400000).toISOString(),
                  user: { id: pc.id, name: pc.name, email: pc.email, role: pc.role || 'CLIENT' },
                  _count: { projects: 0, invoices: 0, tickets: 0, documents: 0 },
                });
              }
            });
          }

          const clientList = Array.from(combinedClientsMap.values());

          // Fetch counts for each client
          for (const client of clientList) {
            try {
              const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('client_id', client.id);
              const { count: invCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('client_id', client.id);
              const { count: tickCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('client_id', client.id);
              const { count: docCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('client_id', client.id);

              client._count = {
                projects: projCount || 0,
                invoices: invCount || 0,
                tickets: tickCount || 0,
                documents: docCount || 0,
              };
            } catch (e) {}
          }

          loadedClients = clientList;
        } catch (err: any) {
          console.error('Supabase direct clients fetch notice:', err);
        }
      }

      setClients(loadedClients);
    } catch (err: any) {
      console.error('Failed to load clients:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    const c1 = subscribeToRealtimeTable('clients', () => loadClients(true));
    const c2 = subscribeToRealtimeTable('portal_clients', () => loadClients(true));
    const intervalId = setInterval(() => loadClients(true), 10000);

    return () => {
      c1.unsubscribe();
      c2.unsubscribe();
      clearInterval(intervalId);
    };
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

  const handleQuickCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceModalClient) return;
    setSubmitting(true);

    try {
      await fetchWithAuth('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          clientId: invoiceModalClient.id,
          invoiceNumber: invoiceForm.invoiceNumber,
          amount: parseFloat(invoiceForm.amount) || 0,
          status: 'UNPAID',
          dueDate: invoiceForm.dueDate,
          description: invoiceForm.description,
        }),
      });

      alert(`Invoice ${invoiceForm.invoiceNumber} generated for ${invoiceModalClient.companyName}!`);
      setInvoiceModalClient(null);
      setInvoiceForm({
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: '499',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        description: 'Web development & retainer service fee',
      });
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Failed to generate invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docModalClient) return;
    setSubmitting(true);

    try {
      const defaultPdfLink = docForm.fileUrl.trim() || `https://platepixel.agency/contracts/${encodeURIComponent(docForm.fileName)}`;

      await fetchWithAuth('/portal/documents', {
        method: 'POST',
        body: JSON.stringify({
          clientId: docModalClient.id,
          fileName: docForm.fileName,
          fileUrl: defaultPdfLink,
        }),
      });

      alert(`Document "${docForm.fileName}" saved to Supabase DB for ${docModalClient.companyName}!`);
      setDocModalClient(null);
      setDocForm({
        docType: 'Change Request Agreement (CRA)',
        fileName: 'Change Request Agreement (CRA).pdf',
        fileUrl: '',
      });
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client account and all related projects/invoices?')) return;

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
              className="huly-input huly-input-icon"
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

                {/* Quick Action Button Row */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setInvoiceModalClient(client);
                      setInvoiceForm({
                        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
                        amount: '499',
                        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                        description: 'Web development & retainer service fee',
                      });
                    }}
                    className="btn-pill-secondary py-1.5 px-2 text-[11px] text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10 flex items-center justify-center space-x-1"
                    title="Generate Invoice for Client"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>+ Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      setDocModalClient(client);
                      setDocForm({
                        docType: 'Change Request Agreement (CRA)',
                        fileName: 'Change Request Agreement (CRA).pdf',
                        fileUrl: '',
                      });
                    }}
                    className="btn-pill-secondary py-1.5 px-2 text-[11px] text-purple-400 border-purple-500/40 hover:bg-purple-500/10 flex items-center justify-center space-x-1"
                    title="Upload Contract PDF for Client"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Upload Doc</span>
                  </button>
                </div>

                {/* Standard Actions Row */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => viewClientDetails(client.id)}
                    className="btn-pill-secondary flex-1 py-1.5 text-xs text-center"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => setEditClient(client)}
                    className="btn-pill-secondary p-2 text-xs text-[#5683da]"
                    title="Edit Client Profile"
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

      {/* MODAL: QUICK GENERATE INVOICE FOR CLIENT */}
      {invoiceModalClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative border-emerald-500/50">
            <button onClick={() => setInvoiceModalClient(null)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Generate Invoice</h3>
            <p className="text-xs text-[#95979e]">Create invoice statement for <span className="text-white font-bold">{invoiceModalClient.companyName}</span> ({invoiceModalClient.user.name})</p>

            <form onSubmit={handleQuickCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                  className="huly-input font-mono"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Amount (₹ INR) *</label>
                <input
                  type="number"
                  required
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  placeholder="14999"
                  className="huly-input font-mono"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  placeholder="Web maintenance & retainer fee"
                  className="huly-input"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-2.5 text-xs bg-emerald-500 hover:bg-emerald-600 border-none text-white font-bold mt-2">
                {submitting ? 'Generating Invoice...' : `Issue Invoice (${invoiceForm.invoiceNumber})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK UPLOAD DOCUMENT FOR CLIENT */}
      {docModalClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative border-purple-500/50">
            <button onClick={() => setDocModalClient(null)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Upload Legal Agreement & Document PDF</h3>
            <p className="text-xs text-[#95979e]">Select agreement preset or custom asset for <span className="text-white font-bold">{docModalClient.companyName}</span></p>

            <form onSubmit={handleQuickUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Agreement / Document Type *</label>
                <select
                  value={docForm.docType}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setDocForm({
                      ...docForm,
                      docType: selected,
                      fileName: selected === 'Custom Document' ? '' : `${selected}.pdf`,
                    });
                  }}
                  className="huly-input bg-[#090a0c]"
                >
                  <option value="Change Request Agreement (CRA)">Change Request Agreement (CRA)</option>
                  <option value="Ownership & Intellectual Property Transfer">Ownership & Intellectual Property Transfer</option>
                  <option value="Hosting & Domain Responsibility Clause">Hosting & Domain Responsibility Clause</option>
                  <option value="Maintenance Agreement (Monthly AMC)">Maintenance Agreement (Monthly AMC)</option>
                  <option value="Master Service Level Agreement (SLA)">Master Service Level Agreement (SLA)</option>
                  <option value="Custom Document">Custom Document / Asset PDF</option>
                </select>
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Document Display Title / Filename *</label>
                <input
                  type="text"
                  required
                  value={docForm.fileName}
                  onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                  placeholder="Change Request Agreement (CRA).pdf"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">File URL / Download Link *</label>
                <input
                  type="text"
                  required
                  value={docForm.fileUrl}
                  onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/... or /assets/cra_agreement.pdf"
                  className="huly-input"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-2.5 text-xs bg-purple-500 hover:bg-purple-600 border-none text-white font-bold mt-2">
                {submitting ? 'Uploading Document...' : `Publish ${docForm.docType.split(' ')[0]} to Client Portal`}
              </button>
            </form>
          </div>
        </div>
      )}

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

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#4a4b50]/40 pb-4">
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

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const found = clients.find(c => c.id === selectedClient.id);
                    if (found) setInvoiceModalClient(found);
                  }}
                  className="btn-pill-secondary py-1.5 px-3 text-xs text-emerald-400 border-emerald-500/40 flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ Invoice</span>
                </button>
                <button
                  onClick={() => {
                    const found = clients.find(c => c.id === selectedClient.id);
                    if (found) setDocModalClient(found);
                  }}
                  className="btn-pill-secondary py-1.5 px-3 text-xs text-purple-400 border-purple-500/40 flex items-center space-x-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Doc</span>
                </button>
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
          <div className="huly-card max-w-md w-full p-6 md:p-8 space-y-4 relative">
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
                <label className="block text-[#95979e] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editClient.phone || ''}
                  onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Business Address</label>
                <input
                  type="text"
                  value={editClient.address || ''}
                  onChange={(e) => setEditClient({ ...editClient, address: e.target.value })}
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Hosting / Domain Renewal Date *</label>
                <input
                  type="date"
                  required
                  value={new Date(editClient.renewalDate).toISOString().split('T')[0]}
                  onChange={(e) => setEditClient({ ...editClient, renewalDate: e.target.value })}
                  className="huly-input"
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

      {/* Modal: Add New Client */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 md:p-8 space-y-4 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Create New Client Account</h3>
            <p className="text-xs text-[#95979e]">Client credentials will be generated automatically to grant access to the Client Portal.</p>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Client Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Alex Rivers"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="alex@riversbistro.com"
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
                  placeholder="Rivers Bistro"
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
                  <label className="block text-[#95979e] mb-1">Renewal Date *</label>
                  <input
                    type="date"
                    required
                    value={newClient.renewalDate}
                    onChange={(e) => setNewClient({ ...newClient, renewalDate: e.target.value })}
                    className="huly-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                {submitting ? 'Creating Account...' : 'Register Client Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Client Account Created Credentials Popup */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-8 space-y-6 text-center border-emerald-500/50">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Client Portal Account Ready</h3>
              <p className="text-xs text-[#95979e] mt-1">Provide these sign-in credentials to your client:</p>
            </div>

            <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/50 text-left text-xs font-mono space-y-2">
              <div><span className="text-[#95979e]">Portal Login:</span> <span className="text-white font-bold">{createdCredentials.credentials?.email}</span></div>
              <div><span className="text-[#95979e]">Temporary Password:</span> <span className="text-emerald-400 font-bold">{createdCredentials.credentials?.password}</span></div>
            </div>

            <button
              onClick={() => setCreatedCredentials(null)}
              className="btn-pill-primary w-full py-2.5 text-xs"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
