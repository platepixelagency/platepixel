import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../services/api';
import { OrbLoader } from '../OrbLoader';
import { 
  Building, 
  Briefcase, 
  FileText, 
  LifeBuoy, 
  FolderCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download, 
  Printer, 
  Plus, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  ArrowUpRight,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface PortalData {
  client: {
    id: string;
    companyName: string;
    phone: string;
    address: string;
    renewalDate: string;
    user: { name: string; email: string };
    projects: any[];
    invoices: any[];
    tickets: any[];
    documents: any[];
  };
  metrics: {
    totalInvoiced: number;
    totalPaid: number;
    pendingBalance: number;
    activeProjects: number;
    openTickets: number;
    totalDocuments: number;
  };
}

export const ClientPortal: React.FC = () => {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'invoices' | 'documents' | 'tickets'>('overview');

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [newDoc, setNewDoc] = useState({ fileName: '', fileUrl: '' });
  const [uploading, setUploading] = useState<boolean>(false);

  // Ticket creation state for clients
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [submittingTicket, setSubmittingTicket] = useState<boolean>(false);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);

    try {
      await fetchWithAuth('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          clientId: data?.client.id,
          subject: newTicket.subject,
          message: newTicket.message,
        }),
      });

      setShowTicketModal(false);
      setNewTicket({ subject: '', message: '' });
      loadPortalData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit support ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth<{ summary: PortalData }>('/portal/summary');
      setData(res.summary);
    } catch (err: any) {
      console.error('Failed to load client portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      await fetchWithAuth('/portal/documents', {
        method: 'POST',
        body: JSON.stringify(newDoc),
      });

      setShowUploadModal(false);
      setNewDoc({ fileName: '', fileUrl: '' });
      loadPortalData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <OrbLoader label="Loading your Client Workspace..." size="lg" />;
  }

  if (!data) {
    return (
      <div className="huly-card p-8 text-center text-red-400">
        Client profile not found. Please contact agency support.
      </div>
    );
  }

  const { client, metrics } = data;
  const renewalDays = Math.ceil((new Date(client.renewalDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNING': return <span className="tag-pill bg-blue-500/20 text-blue-400">PLANNING</span>;
      case 'DEVELOPMENT': return <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964]">DEVELOPMENT</span>;
      case 'TESTING': return <span className="tag-pill bg-purple-500/20 text-purple-400">TESTING</span>;
      case 'DELIVERED': return <span className="tag-pill bg-emerald-500/20 text-emerald-400">LIVE / DELIVERED</span>;
      default: return <span className="tag-pill bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  const getInvoiceBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="tag-pill bg-emerald-500/20 text-emerald-400">PAID</span>;
      case 'PENDING': return <span className="tag-pill bg-amber-500/20 text-amber-400">PENDING</span>;
      case 'OVERDUE': return <span className="tag-pill bg-red-500/20 text-red-400">OVERDUE</span>;
      default: return <span className="tag-pill bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Client Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111111] via-[#151a26] to-[#111111] border border-[#5683da]/40 p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#5683da]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="tag-pill bg-[#5683da]/20 text-[#5683da] border border-[#5683da]/30 flex items-center space-x-1">
                <Globe className="w-3 h-3 text-[#ff8964]" />
                <span>Client Portal Active</span>
              </span>
              <span className="text-xs text-[#95979e] font-mono">Account: {client.companyName}</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {client.user.name}
            </h1>
            <p className="text-sm text-[#95979e] mt-1">
              Your digital agency portal for web development, hosting renewals, invoices, and support.
            </p>
          </div>

          {/* Renewal Status Badge */}
          <div className="huly-card px-5 py-3 border-emerald-500/40 bg-emerald-500/5 text-right">
            <div className="text-[10px] text-[#95979e] uppercase font-mono">Website & Domain Renewal</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center justify-end space-x-1 mt-0.5 font-mono">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{new Date(client.renewalDate).toLocaleDateString()} ({renewalDays} days remaining)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-3 border-b border-[#4a4b50]/40 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
              : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'projects'
              ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
              : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#ff8964]" />
          <span>My Projects</span>
          <span className="w-5 h-5 rounded-full bg-[#ff8964] text-black text-[10px] font-bold flex items-center justify-center">
            {client.projects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'invoices'
              ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
              : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Invoices & Statements</span>
          <span className="w-5 h-5 rounded-full bg-emerald-400 text-black text-[10px] font-bold flex items-center justify-center">
            {client.invoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'documents'
              ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
              : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
          }`}
        >
          <FolderCheck className="w-4 h-4 text-purple-400" />
          <span>Documents Hub</span>
          <span className="w-5 h-5 rounded-full bg-purple-400 text-black text-[10px] font-bold flex items-center justify-center">
            {client.documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'tickets'
              ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
              : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
          }`}
        >
          <LifeBuoy className="w-4 h-4 text-amber-400" />
          <span>Support Tickets</span>
          <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
            {client.tickets.length}
          </span>
        </button>
      </div>

      {/* Overview Metrics Cards */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="huly-card p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#95979e] uppercase font-mono">Website Status</div>
                <div className="text-sm font-semibold text-emerald-400 flex items-center space-x-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active & Secure</span>
                </div>
              </div>
            </div>

            <div className="huly-card p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#95979e] uppercase font-mono">Active Projects</div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {metrics.activeProjects} In Progress
                </div>
              </div>
            </div>

            <div className="huly-card p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#95979e] uppercase font-mono">Pending Invoices</div>
                <div className="text-sm font-semibold text-amber-400 mt-0.5 font-mono">
                  ${metrics.pendingBalance.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="huly-card p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FolderCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#95979e] uppercase font-mono">Project Files</div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {metrics.totalDocuments} Uploaded
                </div>
              </div>
            </div>
          </div>

          {/* Quick Section Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Active Projects Card */}
            <div className="huly-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-[#ff8964]" />
                  <span>My Web Projects</span>
                </h3>
                <button onClick={() => setActiveTab('projects')} className="text-xs text-[#5683da] hover:underline font-mono">
                  View All ({client.projects.length}) →
                </button>
              </div>

              {client.projects.length === 0 ? (
                <div className="p-6 bg-[#090a0c] rounded-xl text-xs text-[#95979e] text-center border border-[#4a4b50]/30">
                  No active web projects. Contact agency support to launch a new site build.
                </div>
              ) : (
                client.projects.slice(0, 3).map(p => (
                  <div key={p.id} className="p-4 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{p.projectName}</span>
                      {getProjectStatusBadge(p.status)}
                    </div>
                    <p className="text-[11px] text-[#95979e] line-clamp-1">{p.description}</p>
                    <div className="text-[10px] text-emerald-400 font-mono pt-1">
                      Target Delivery: {new Date(p.deliveryDate).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* My Recent Invoices Card */}
            <div className="huly-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#ffffff] text-base flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Recent Invoices</span>
                </h3>
                <button onClick={() => setActiveTab('invoices')} className="text-xs text-[#5683da] hover:underline font-mono">
                  View All ({client.invoices.length}) →
                </button>
              </div>

              {client.invoices.length === 0 ? (
                <div className="p-6 bg-[#090a0c] rounded-xl text-xs text-[#95979e] text-center border border-[#4a4b50]/30">
                  No invoices issued yet.
                </div>
              ) : (
                client.invoices.slice(0, 3).map(inv => (
                  <div key={inv.id} className="p-4 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-white block">{inv.invoiceNumber}</span>
                      <span className="text-[#95979e] text-[10px]">{new Date(inv.createdAt).toLocaleDateString()}</span>
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
        </div>
      )}

      {/* Tab: My Projects Detail List */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Active & Delivered Web Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {client.projects.length === 0 ? (
              <div className="col-span-2 huly-card p-12 text-center text-[#95979e]">
                No projects assigned to your account yet.
              </div>
            ) : (
              client.projects.map(p => (
                <div key={p.id} className="huly-card p-6 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-base text-white">{p.projectName}</h4>
                      {getProjectStatusBadge(p.status)}
                    </div>
                    <p className="text-xs text-[#95979e] leading-relaxed mb-4">{p.description || 'No description provided.'}</p>
                  </div>
                  <div className="pt-3 border-t border-[#4a4b50]/40 flex justify-between items-center text-xs font-mono">
                    <span className="text-[#95979e]">Target Delivery:</span>
                    <span className="text-emerald-400 font-bold">{new Date(p.deliveryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Invoices & Statements */}
      {activeTab === 'invoices' && (
        <div className="huly-card overflow-hidden">
          <div className="p-6 border-b border-[#4a4b50]/40 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Invoices & Payment History</h3>
            <span className="text-xs font-mono text-emerald-400">Total Paid: ₹{metrics.totalPaid.toLocaleString('en-IN')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090a0c] text-[#95979e] uppercase font-mono border-b border-[#4a4b50]/60">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">View Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4a4b50]/40">
                {client.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#95979e]">No invoices issued.</td>
                  </tr>
                ) : (
                  client.invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-[#090a0c]/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="p-4 text-[#95979e] font-mono">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-mono font-bold text-white">₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4">{getInvoiceBadge(inv.status)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="btn-pill-secondary py-1 px-4 text-[11px]"
                        >
                          Print PDF
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

      {/* Tab: Documents Hub */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
            <div>
              <h3 className="text-xl font-bold text-white">Project Documents & Assets</h3>
              <p className="text-xs text-[#95979e]">Download contract agreements, website spec PDFs, and design assets uploaded by your agency manager.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {client.documents.length === 0 ? (
              <div className="col-span-3 huly-card p-12 text-center text-[#95979e]">
                No project documents uploaded by agency yet.
              </div>
            ) : (
              client.documents.map(doc => (
                <div key={doc.id} className="huly-card p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                      <FolderCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{doc.fileName}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="tag-pill bg-purple-500/20 text-purple-300 font-mono text-[9px]">Legal Agreement</span>
                        <span className="text-[10px] text-[#95979e] font-mono">{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    download
                    rel="noreferrer"
                    className="btn-pill-secondary w-full py-2 text-xs text-center flex items-center justify-center space-x-1.5 text-[#5683da]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File / PDF</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Support Tickets */}
      {activeTab === 'tickets' && (
        <div className="huly-card p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-[#4a4b50]/40 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Support & Service Tickets</h3>
              <p className="text-xs text-[#95979e]">Submit support requests for content edits, technical updates, or domain assistance.</p>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Open Support Ticket</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {client.tickets.length === 0 ? (
              <div className="p-8 bg-[#090a0c] rounded-xl text-xs text-[#95979e] text-center border border-[#4a4b50]/30">
                No support tickets opened yet. Click &quot;Open Support Ticket&quot; above to submit an inquiry.
              </div>
            ) : (
              client.tickets.map(t => (
                <div key={t.id} className="p-4 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">{t.subject}</span>
                    <span className="text-[#95979e] text-[11px] block mt-0.5">{t.message}</span>
                    <span className="text-[10px] text-[#95979e] font-mono mt-1 block">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="tag-pill bg-[#5683da]/20 text-[#5683da]">{t.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-xl w-full p-8 space-y-6 relative border-[#5683da]/50">
            <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-6 border-b border-[#4a4b50]/60">
              <div>
                <span className="text-xl font-bold text-white">PlatePixel Agency</span>
                <span className="text-[10px] text-[#95979e] uppercase font-mono block">Client Statement</span>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-mono font-bold text-[#5683da]">{selectedInvoice.invoiceNumber}</h3>
                {getInvoiceBadge(selectedInvoice.status)}
              </div>
            </div>

            <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/40 text-xs space-y-1">
              <div><span className="text-[#95979e]">Billed To:</span> <span className="text-white font-bold">{client.companyName}</span></div>
              <div><span className="text-[#95979e]">Contact:</span> <span className="text-white">{client.user.name} ({client.user.email})</span></div>
              <div><span className="text-[#95979e]">Issued Date:</span> <span className="text-mono text-white">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span></div>
              <div><span className="text-[#95979e]">Amount Due:</span> <span className="font-mono text-emerald-400 font-bold">${selectedInvoice.amount}</span></div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#4a4b50]/40">
              <button onClick={() => window.print()} className="btn-pill-secondary py-2 px-4 text-xs flex items-center space-x-1.5">
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="btn-pill-primary py-2 px-6 text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Upload Document Asset</h3>

            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={newDoc.fileName}
                  onChange={(e) => setNewDoc({ ...newDoc, fileName: e.target.value })}
                  placeholder="Website Contract SLA.pdf"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">File URL / Asset Link *</label>
                <input
                  type="text"
                  required
                  value={newDoc.fileUrl}
                  onChange={(e) => setNewDoc({ ...newDoc, fileUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="huly-input"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                {uploading ? 'Uploading...' : 'Save Document to Workspace'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Open Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative border-[#5683da]/50">
            <button onClick={() => setShowTicketModal(false)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Open Support Ticket</h3>
            <p className="text-xs text-[#95979e]">Submit a ticket for technical support, menu edits, or website updates.</p>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Ticket Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Need seasonal menu price update"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Detailed Request Message *</label>
                <textarea
                  rows={4}
                  required
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Please describe the updates or support needed for your site..."
                  className="huly-input"
                />
              </div>

              <button
                type="submit"
                disabled={submittingTicket}
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                {submittingTicket ? 'Submitting Ticket...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
