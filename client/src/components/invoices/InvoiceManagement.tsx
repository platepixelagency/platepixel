import React, { useEffect, useState } from 'react';
import { Invoice, Client } from '../../types';
import { fetchWithAuth } from '../../services/api';
import { 
  FileText, 
  Plus, 
  Search, 
  DollarSign, 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  X, 
  Trash2, 
  CreditCard,
  Sparkles,
  Download,
  ShieldCheck
} from 'lucide-react';

interface PaymentItem {
  id: string;
  amount: number;
  paymentDate: string;
}

interface ExtendedInvoice extends Invoice {
  client: {
    id: string;
    companyName: string;
    phone: string;
    address: string;
    user: {
      name: string;
      email: string;
    };
  };
  payments: PaymentItem[];
}

export const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ExtendedInvoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<ExtendedInvoice | null>(null);

  // New Invoice Form
  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    amount: '',
    status: 'PENDING',
  });

  // Record Payment Form
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, clientRes] = await Promise.all([
        fetchWithAuth<{ invoices: ExtendedInvoice[] }>('/invoices'),
        fetchWithAuth<{ clients: any[] }>('/clients'),
      ]);
      setInvoices(invRes.invoices);
      setClients(clientRes.clients);
      if (clientRes.clients.length > 0 && !newInvoice.clientId) {
        setNewInvoice(prev => ({ ...prev, clientId: clientRes.clients[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load invoice management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetchWithAuth('/invoices', {
        method: 'POST',
        body: JSON.stringify(newInvoice),
      });

      setShowAddModal(false);
      setNewInvoice({
        clientId: clients[0]?.id || '',
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: '',
        status: 'PENDING',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      await fetchWithAuth(`/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice(prev => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    try {
      await fetchWithAuth(`/invoices/${paymentModalInvoice.id}/payments`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      setPaymentModalInvoice(null);
      setPaymentData({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await fetchWithAuth(`/invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      setSelectedInvoice(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete invoice');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.companyName.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.user.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((acc, i) => acc + i.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="tag-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PAID</span>;
      case 'PENDING':
        return <span className="tag-pill bg-amber-500/20 text-amber-400 border border-amber-500/30">PENDING</span>;
      case 'OVERDUE':
        return <span className="tag-pill bg-red-500/20 text-red-400 border border-red-500/30">OVERDUE</span>;
      default:
        return <span className="tag-pill bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="huly-card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#95979e] uppercase font-mono">Total Invoiced</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">${totalInvoiced.toLocaleString()}</div>
          </div>
        </div>

        <div className="huly-card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#95979e] uppercase font-mono">Collected Payments</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">${totalPaid.toLocaleString()}</div>
          </div>
        </div>

        <div className="huly-card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#95979e] uppercase font-mono">Pending Balance</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-0.5">${totalPending.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-[10px] uppercase">Financial Module</span>
            <span className="text-xs text-[#95979e] font-mono">{invoices.length} Issued Invoices</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Invoice Directory & Payments</h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice or client..."
              className="huly-input huly-input-icon"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map(st => (
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

      {/* Invoices Data Table */}
      <div className="huly-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090a0c] text-[#95979e] uppercase font-mono border-b border-[#4a4b50]/60">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Client Company</th>
                <th className="p-4">Date Issued</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4a4b50]/40">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#95979e]">
                    No invoices found. Create a new invoice to get started.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-[#090a0c]/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                    <td className="p-4 font-medium text-[#ff8964]">
                      {inv.client.companyName}
                      <span className="block text-[10px] text-[#95979e] font-normal">{inv.client.user.name}</span>
                    </td>
                    <td className="p-4 font-mono text-[#95979e]">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-mono font-bold text-white text-sm">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="p-4">{getStatusBadge(inv.status)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="btn-pill-secondary py-1 px-3 text-[11px]"
                      >
                        Print PDF
                      </button>

                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => {
                            setPaymentModalInvoice(inv);
                            setPaymentData({ amount: inv.amount.toString(), paymentDate: new Date().toISOString().split('T')[0] });
                          }}
                          className="btn-pill-primary py-1 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-500"
                        >
                          Log Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Printable / PDF Invoice Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-2xl w-full p-8 space-y-6 relative max-h-[90vh] overflow-y-auto border-[#5683da]/50">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Invoice Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#4a4b50]/60">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#ff8964]" />
                  <span className="text-xl font-bold text-white tracking-tight">PlatePixel Agency</span>
                </div>
                <span className="text-[10px] text-[#95979e] uppercase font-mono">Official Invoice Statement</span>
              </div>

              <div className="text-right">
                <h3 className="text-2xl font-mono font-extrabold text-[#5683da]">{selectedInvoice.invoiceNumber}</h3>
                <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
              </div>
            </div>

            {/* Client & Date Meta */}
            <div className="grid grid-cols-2 gap-6 bg-[#090a0c] p-6 rounded-xl border border-[#4a4b50]/40 text-xs">
              <div>
                <span className="text-[#95979e] uppercase font-mono text-[10px] block mb-1">Billed To Client</span>
                <span className="font-bold text-white text-sm block">{selectedInvoice.client.companyName}</span>
                <span className="text-[#95979e] block">{selectedInvoice.client.user.name}</span>
                <span className="text-[#95979e] block">{selectedInvoice.client.user.email}</span>
                <span className="text-[#95979e] block">{selectedInvoice.client.phone}</span>
              </div>

              <div className="text-right space-y-1 font-mono">
                <span className="text-[#95979e] uppercase text-[10px] block mb-1">Invoice Dates</span>
                <div>Issue Date: <span className="text-white">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span></div>
                <div>Status: <span className="text-emerald-400 font-bold">{selectedInvoice.status}</span></div>
              </div>
            </div>

            {/* Invoice Line Item Breakdown */}
            <div className="border border-[#4a4b50]/40 rounded-xl overflow-hidden text-xs">
              <div className="bg-[#090a0c] p-3 text-[#95979e] font-mono uppercase grid grid-cols-4 border-b border-[#4a4b50]/40">
                <span className="col-span-3">Description</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="p-4 grid grid-cols-4 items-center">
                <div className="col-span-3">
                  <span className="font-bold text-white block">Digital Agency Web Services Retainer</span>
                  <span className="text-[#95979e] text-[11px]">Website development, hosting management & maintenance services.</span>
                </div>
                <div className="text-right font-mono font-bold text-white text-base">
                  ${selectedInvoice.amount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Payments History Log */}
            {selectedInvoice.payments?.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase text-[#95979e] mb-2">Recorded Payment Logs</h4>
                <div className="space-y-2">
                  {selectedInvoice.payments.map(p => (
                    <div key={p.id} className="p-3 bg-[#090a0c] rounded-xl border border-[#4a4b50]/40 flex justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">+${p.amount} Received</span>
                      <span className="text-[#95979e]">{new Date(p.paymentDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Row */}
            <div className="pt-4 border-t border-[#4a4b50]/40 flex justify-between items-center">
              <button
                onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                className="text-xs text-red-400 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Invoice</span>
              </button>

              <div className="space-x-3">
                <button
                  onClick={() => window.print()}
                  className="btn-pill-secondary py-2 px-4 text-xs inline-flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="btn-pill-primary py-2 px-6 text-xs"
                >
                  Close Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative border-emerald-500/50">
            <button
              onClick={() => setPaymentModalInvoice(null)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Log Payment Receipt</h3>
            <p className="text-xs text-[#95979e]">
              Invoice: <span className="text-[#5683da] font-mono">{paymentModalInvoice.invoiceNumber}</span> ({paymentModalInvoice.client.companyName})
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Amount Received ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="huly-input font-mono text-base font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  className="huly-input font-mono"
                />
              </div>

              <button
                type="submit"
                className="btn-pill-primary w-full py-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 mt-2"
              >
                Confirm Payment Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Invoice */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Create New Invoice</h3>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Assign Client *</label>
                {clients.length === 0 ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    No clients found. Convert a lead or add a client first.
                  </div>
                ) : (
                  <select
                    value={newInvoice.clientId}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                    className="huly-input"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.user.name})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={newInvoice.invoiceNumber}
                  onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                  className="huly-input font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#95979e] mb-1">Invoice Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    placeholder="499.00"
                    className="huly-input font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Status</label>
                  <select
                    value={newInvoice.status}
                    onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}
                    className="huly-input"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || clients.length === 0}
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                {submitting ? 'Issuing Invoice...' : 'Issue Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
