import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Trash2,
  CreditCard,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { supabase, subscribeToRealtimeTable } from '../../services/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────
interface PaymentItem {
  id: string;
  amount: number;
  payment_date: string;
}

interface ExtendedInvoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    companyName: string;
    phone: string;
    address: string;
    user: { name: string; email: string };
  };
  payments: PaymentItem[];
}

// ─── Component ──────────────────────────────────────────────────────────────
export const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ExtendedInvoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<ExtendedInvoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forms
  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    amount: '',
    status: 'PENDING',
    description: '',
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
  });

  // ─── Load Data (Direct Supabase) ─────────────────────────────────────────
  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const [invResult, clientResult, portalResult] = await Promise.all([
        supabase
          .from('invoices')
          .select(`
            *,
            client:clients(id, company_name, phone, address, user:users(name, email)),
            payments(*)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('clients').select('id, company_name, user:users(name, email)'),
        supabase.from('portal_clients').select('id, name, email, company_name'),
      ]);

      if (invResult.error) console.warn('[Invoices] fetch error:', invResult.error.message);

      if (invResult.data) {
        const mapped: ExtendedInvoice[] = invResult.data.map((inv: any) => ({
          id: inv.id,
          clientId: inv.client_id,
          invoiceNumber: inv.invoice_number || inv.invoiceNumber || '—',
          amount: parseFloat(inv.amount) || 0,
          status: inv.status || 'PENDING',
          createdAt: inv.created_at,
          updatedAt: inv.updated_at,
          payments: Array.isArray(inv.payments) ? inv.payments : [],
          client: inv.client
            ? {
                id: inv.client.id,
                companyName: inv.client.company_name || 'Unknown',
                phone: inv.client.phone || '',
                address: inv.client.address || '',
                user: inv.client.user || { name: inv.client.company_name || 'Client', email: '' },
              }
            : { id: inv.client_id || '', companyName: 'Unknown Client', phone: '', address: '', user: { name: '', email: '' } },
        }));
        setInvoices(mapped);
      }

      // Build combined client list
      const clientMap = new Map<string, any>();
      (clientResult.data || []).forEach((c: any) =>
        clientMap.set(c.id, { id: c.id, companyName: c.company_name, user: c.user || { name: c.company_name, email: '' } })
      );
      (portalResult.data || []).forEach((pc: any) => {
        if (!clientMap.has(pc.id))
          clientMap.set(pc.id, { id: pc.id, companyName: pc.company_name || `${pc.name}'s Business`, user: { name: pc.name, email: pc.email } });
      });

      const allClients = Array.from(clientMap.values());
      setClients(allClients);

      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('[InvoiceManagement] loadData error:', err);
      setError('Failed to load data. Check your connection.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const sub = subscribeToRealtimeTable('invoices', () => loadData(true));
    const paymentSub = subscribeToRealtimeTable('payments', () => loadData(true));
    const intervalId = setInterval(() => loadData(true), 15000);
    return () => {
      sub.unsubscribe();
      paymentSub.unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  // ─── Create Invoice (Direct Supabase) ───────────────────────────────────
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.clientId) { setError('Please select a client.'); return; }
    if (!newInvoice.amount || parseFloat(newInvoice.amount) <= 0) { setError('Enter a valid amount.'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertErr } = await supabase.from('invoices').insert({
        client_id: newInvoice.clientId,
        invoice_number: newInvoice.invoiceNumber.trim(),
        amount: parseFloat(newInvoice.amount),
        status: newInvoice.status,
      });

      if (insertErr) throw new Error(insertErr.message);

      setShowAddModal(false);
      setNewInvoice({
        clientId: clients[0]?.id || '',
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: '',
        status: 'PENDING',
        description: '',
      });
      await loadData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Update Status (Direct Supabase) ────────────────────────────────────
  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error: upErr } = await supabase
        .from('invoices')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', invoiceId);
      if (upErr) throw new Error(upErr.message);

      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv));
      if (selectedInvoice?.id === invoiceId) setSelectedInvoice(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      alert('Update failed: ' + err.message);
    }
  };

  // ─── Record Payment (Direct Supabase) ───────────────────────────────────
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) { alert('Enter a valid payment amount.'); return; }

    setSubmitting(true);
    try {
      const { error: payErr } = await supabase.from('payments').insert({
        invoice_id: paymentModalInvoice.id,
        amount: parseFloat(paymentData.amount),
        payment_date: new Date(paymentData.payment_date).toISOString(),
      });
      if (payErr) throw new Error(payErr.message);

      // Auto-mark invoice as PAID if full amount recorded
      const totalPaidSoFar = (paymentModalInvoice.payments || []).reduce((s, p) => s + p.amount, 0) + parseFloat(paymentData.amount);
      if (totalPaidSoFar >= paymentModalInvoice.amount) {
        await supabase.from('invoices').update({ status: 'PAID', updated_at: new Date().toISOString() }).eq('id', paymentModalInvoice.id);
      }

      setPaymentModalInvoice(null);
      setPaymentData({ amount: '', payment_date: new Date().toISOString().split('T')[0] });
      await loadData(true);
    } catch (err: any) {
      alert('Payment failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete Invoice (Direct Supabase) ───────────────────────────────────
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This cannot be undone.')) return;
    try {
      // Delete payments first (FK constraint)
      await supabase.from('payments').delete().eq('invoice_id', invoiceId);
      const { error: delErr } = await supabase.from('invoices').delete().eq('id', invoiceId);
      if (delErr) throw new Error(delErr.message);
      setSelectedInvoice(null);
      await loadData(true);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // ─── Print Invoice ───────────────────────────────────────────────────────
  const handlePrint = (inv: ExtendedInvoice) => {
    const totalPayments = inv.payments.reduce((s, p) => s + p.amount, 0);
    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Invoice ${inv.invoiceNumber} – PlatePixel Agency</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #5683da; padding-bottom: 20px; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 800; color: #5683da; }
          .brand-sub { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 2px; }
          .inv-meta { text-align: right; }
          .inv-number { font-size: 24px; font-weight: 900; color: #5683da; font-family: monospace; }
          .status { display: inline-block; margin-top: 4px; padding: 3px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .status-PAID { background: #d1fae5; color: #065f46; }
          .status-PENDING { background: #fef3c7; color: #92400e; }
          .status-OVERDUE { background: #fee2e2; color: #991b1b; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .label { font-size: 9px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 4px; }
          .value { font-size: 13px; font-weight: 600; color: #111; }
          .value-sm { font-size: 11px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          thead { background: #f1f3f9; }
          th { padding: 10px 14px; text-align: left; font-size: 10px; text-transform: uppercase; color: #666; letter-spacing: 1px; }
          td { padding: 12px 14px; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
          .amount-col { text-align: right; font-weight: 700; font-family: monospace; }
          .total-row { background: #f8f9fa; font-weight: 800; }
          .payments-section { margin-top: 20px; }
          .payment-item { display: flex; justify-content: space-between; padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; margin-bottom: 6px; border-radius: 4px; font-size: 11px; }
          .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 10px; color: #888; display: flex; justify-content: space-between; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">🟠 PlatePixel Agency</div>
            <div class="brand-sub">Official Invoice Statement</div>
          </div>
          <div class="inv-meta">
            <div class="inv-number">${inv.invoiceNumber}</div>
            <span class="status status-${inv.status}">${inv.status}</span>
          </div>
        </div>

        <div class="grid2">
          <div>
            <div class="label">Billed To Client</div>
            <div class="value">${inv.client.companyName}</div>
            <div class="value-sm">${inv.client.user.name}</div>
            <div class="value-sm">${inv.client.user.email}</div>
            ${inv.client.phone ? `<div class="value-sm">${inv.client.phone}</div>` : ''}
            ${inv.client.address ? `<div class="value-sm">${inv.client.address}</div>` : ''}
          </div>
          <div style="text-align:right">
            <div class="label">Invoice Dates</div>
            <div class="value-sm">Issue Date: <strong>${new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></div>
            <div class="value-sm">Status: <strong>${inv.status}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:60%">Description</th>
              <th class="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Digital Agency Web Services Retainer</strong><br/>
                <span style="color:#666; font-size:11px">Website development, hosting management &amp; maintenance services.</span>
              </td>
              <td class="amount-col">₹${inv.amount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td style="text-align:right; font-size:12px; color:#555">Total Due</td>
              <td class="amount-col" style="font-size:16px; color:#5683da">₹${inv.amount.toLocaleString('en-IN')}</td>
            </tr>
            ${totalPayments > 0 ? `
            <tr style="background:#f0fdf4">
              <td style="text-align:right; font-size:12px; color:#555">Amount Received</td>
              <td class="amount-col" style="color:#059669">₹${totalPayments.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="background:#fef9f0">
              <td style="text-align:right; font-size:12px; color:#555">Balance Due</td>
              <td class="amount-col" style="color:#dc2626; font-size:14px">₹${Math.max(0, inv.amount - totalPayments).toLocaleString('en-IN')}</td>
            </tr>` : ''}
          </tfoot>
        </table>

        ${inv.payments.length > 0 ? `
          <div class="payments-section">
            <div class="label" style="margin-bottom:8px">Recorded Payment Receipts</div>
            ${inv.payments.map(p => `
              <div class="payment-item">
                <span style="color:#059669; font-weight:700">✓ ₹${p.amount.toLocaleString('en-IN')} Received</span>
                <span style="color:#555">${new Date(p.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          <div>PlatePixel Agency — Digital Excellence Platform</div>
          <div>Generated: ${new Date().toLocaleString('en-IN')}</div>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
    }
  };

  // ─── Computed Stats ──────────────────────────────────────────────────────
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.amount, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.payments.reduce((s, p) => s + p.amount, 0), 0);
  const totalPending = totalInvoiced - totalCollected;

  const filteredInvoices = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.client.companyName.toLowerCase().includes(q) ||
      inv.client.user.name.toLowerCase().includes(q);
    return matchesSearch && (statusFilter === 'ALL' || inv.status === statusFilter);
  });

  // ─── Status Badge ────────────────────────────────────────────────────────
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

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Financial Overview Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="huly-card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#95979e] uppercase font-mono">Total Invoiced</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">₹{totalInvoiced.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-[#95979e] mt-0.5">{invoices.length} invoices</div>
          </div>
        </div>

        <div className="huly-card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#95979e] uppercase font-mono">Collected Payments</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">₹{totalCollected.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-emerald-400/60 mt-0.5">from payments table</div>
          </div>
        </div>

        <div className="huly-card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#95979e] uppercase font-mono">Pending Balance</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-0.5">₹{Math.max(0, totalPending).toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-amber-400/60 mt-0.5">outstanding</div>
          </div>
        </div>
      </div>

      {/* ── Header & Controls ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-[10px] uppercase">Financial Module</span>
            <span className="text-xs text-[#95979e] font-mono">{invoices.length} Issued Invoices</span>
            <span className="text-[10px] text-[#95979e]/50 font-mono">· Last sync {lastRefresh.toLocaleTimeString()}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Invoice Directory &amp; Payments</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => loadData()} className="w-9 h-9 rounded-xl bg-[#1c1d22] border border-[#4a4b50] flex items-center justify-center text-[#95979e] hover:text-white hover:border-[#5683da] transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
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
            onClick={() => { setError(null); setShowAddModal(true); }}
            className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && !showAddModal && !paymentModalInvoice && (
        <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Status Filters ── */}
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
            <span className="ml-1.5 opacity-60 text-[10px]">
              ({st === 'ALL' ? invoices.length : invoices.filter(i => i.status === st).length})
            </span>
          </button>
        ))}
      </div>

      {/* ── Invoice Table ── */}
      <div className="huly-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#95979e] text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#5683da]" />
            Loading invoices from Supabase…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090a0c] text-[#95979e] uppercase font-mono border-b border-[#4a4b50]/60">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Client Company</th>
                  <th className="p-4">Date Issued</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Collected</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4a4b50]/40">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-[#95979e]">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No invoices found.{' '}
                      <button onClick={() => setShowAddModal(true)} className="text-[#5683da] underline">
                        Create your first invoice
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const collected = inv.payments.reduce((s, p) => s + p.amount, 0);
                    return (
                      <tr key={inv.id} className="hover:bg-[#090a0c]/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                        <td className="p-4 font-medium text-[#ff8964]">
                          {inv.client.companyName}
                          <span className="block text-[10px] text-[#95979e] font-normal">{inv.client.user.name}</span>
                        </td>
                        <td className="p-4 font-mono text-[#95979e]">
                          {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-4 font-mono font-bold text-white text-sm">
                          ₹{inv.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-mono text-emerald-400">
                          {collected > 0 ? `₹${collected.toLocaleString('en-IN')}` : <span className="text-[#95979e]">—</span>}
                        </td>
                        <td className="p-4">
                          <select
                            value={inv.status}
                            onChange={(e) => handleUpdateStatus(inv.id, e.target.value)}
                            className="bg-transparent border-none outline-none cursor-pointer text-xs"
                          >
                            {['PENDING', 'PAID', 'OVERDUE'].map(s => (
                              <option key={s} value={s} className="bg-[#1c1d22]">{s}</option>
                            ))}
                          </select>
                          {getStatusBadge(inv.status)}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handlePrint(inv)}
                            className="btn-pill-secondary py-1 px-3 text-[11px] inline-flex items-center space-x-1"
                            title="Print Invoice PDF"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print</span>
                          </button>

                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setPaymentModalInvoice(inv);
                                setPaymentData({ amount: String(Math.max(0, inv.amount - inv.payments.reduce((s, p) => s + p.amount, 0))), payment_date: new Date().toISOString().split('T')[0] });
                              }}
                              className="btn-pill-primary py-1 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-500 inline-flex items-center space-x-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Log Payment</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="btn-pill-secondary py-1 px-3 text-[11px]"
                            title="View Invoice"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL: View / Print Invoice
         ══════════════════════════════════════════════════════════ */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-2xl w-full p-8 space-y-6 relative max-h-[90vh] overflow-y-auto border-[#5683da]/50">
            <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
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

            {/* Client & Dates */}
            <div className="grid grid-cols-2 gap-6 bg-[#090a0c] p-6 rounded-xl border border-[#4a4b50]/40 text-xs">
              <div>
                <span className="text-[#95979e] uppercase font-mono text-[10px] block mb-1">Billed To Client</span>
                <span className="font-bold text-white text-sm block">{selectedInvoice.client.companyName}</span>
                <span className="text-[#95979e] block">{selectedInvoice.client.user.name}</span>
                <span className="text-[#95979e] block">{selectedInvoice.client.user.email}</span>
                {selectedInvoice.client.phone && <span className="text-[#95979e] block">{selectedInvoice.client.phone}</span>}
              </div>
              <div className="text-right space-y-1 font-mono">
                <span className="text-[#95979e] uppercase text-[10px] block mb-1">Invoice Dates</span>
                <div>Issue Date: <span className="text-white">{new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN')}</span></div>
                <div>Status: <span className={selectedInvoice.status === 'PAID' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{selectedInvoice.status}</span></div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-[#4a4b50]/40 rounded-xl overflow-hidden text-xs">
              <div className="bg-[#090a0c] p-3 text-[#95979e] font-mono uppercase grid grid-cols-4 border-b border-[#4a4b50]/40">
                <span className="col-span-3">Description</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="p-4 grid grid-cols-4 items-center">
                <div className="col-span-3">
                  <span className="font-bold text-white block">Digital Agency Web Services Retainer</span>
                  <span className="text-[#95979e] text-[11px]">Website development, hosting management &amp; maintenance services.</span>
                </div>
                <div className="text-right font-mono font-bold text-white text-base">
                  ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                </div>
              </div>
              {/* Summary rows */}
              {(() => {
                const collected = selectedInvoice.payments.reduce((s, p) => s + p.amount, 0);
                const balance = selectedInvoice.amount - collected;
                return collected > 0 ? (
                  <>
                    <div className="px-4 py-2 border-t border-[#4a4b50]/40 grid grid-cols-4 text-xs">
                      <span className="col-span-3 text-right text-[#95979e]">Amount Received</span>
                      <span className="text-right font-mono text-emerald-400 font-bold">− ₹{collected.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-4 py-2 bg-[#090a0c] grid grid-cols-4 text-xs">
                      <span className="col-span-3 text-right text-[#95979e]">Balance Due</span>
                      <span className="text-right font-mono text-red-400 font-bold">₹{Math.max(0, balance).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : null;
              })()}
            </div>

            {/* Payment History */}
            {selectedInvoice.payments?.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase text-[#95979e] mb-2">Recorded Payment Receipts</h4>
                <div className="space-y-2">
                  {selectedInvoice.payments.map(p => (
                    <div key={p.id} className="p-3 bg-[#090a0c] rounded-xl border border-emerald-500/20 flex justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">✓ ₹{p.amount.toLocaleString('en-IN')} Received</span>
                      <span className="text-[#95979e]">{new Date(p.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Update */}
            <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/40">
              <span className="text-[10px] text-[#95979e] uppercase font-mono block mb-2">Update Status</span>
              <div className="flex space-x-2">
                {['PENDING', 'PAID', 'OVERDUE'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(selectedInvoice.id, s)}
                    className={`tag-pill text-[11px] py-1.5 px-3 transition-all ${
                      selectedInvoice.status === s
                        ? s === 'PAID' ? 'bg-emerald-500 text-white' : s === 'OVERDUE' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                        : 'bg-[#1c1d22] border border-[#4a4b50] text-[#95979e] hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
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
                  onClick={() => handlePrint(selectedInvoice)}
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

      {/* ══════════════════════════════════════════════════════════
          MODAL: Log Payment Receipt
         ══════════════════════════════════════════════════════════ */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative border-emerald-500/50">
            <button onClick={() => setPaymentModalInvoice(null)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Log Payment Receipt</h3>
                <p className="text-xs text-[#95979e]">
                  Invoice: <span className="text-[#5683da] font-mono">{paymentModalInvoice.invoiceNumber}</span> ({paymentModalInvoice.client.companyName})
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#090a0c] rounded-xl p-4 text-xs font-mono space-y-1 border border-[#4a4b50]/40">
              <div className="flex justify-between"><span className="text-[#95979e]">Invoice Total</span><span className="text-white">₹{paymentModalInvoice.amount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-[#95979e]">Previously Collected</span><span className="text-emerald-400">₹{paymentModalInvoice.payments.reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between border-t border-[#4a4b50]/40 pt-1 mt-1"><span className="text-[#95979e]">Balance Remaining</span><span className="text-amber-400 font-bold">₹{Math.max(0, paymentModalInvoice.amount - paymentModalInvoice.payments.reduce((s, p) => s + p.amount, 0)).toLocaleString('en-IN')}</span></div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
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
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                  className="huly-input font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-pill-primary w-full py-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 mt-2 flex items-center justify-center space-x-2"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Recording…' : 'Confirm Payment Receipt'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: Create New Invoice
         ══════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => { setShowAddModal(false); setError(null); }} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Create New Invoice</h3>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Assign Client *</label>
                {clients.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
                    No clients found. Convert a lead or add a client first.
                  </div>
                ) : (
                  <select
                    value={newInvoice.clientId}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                    className="huly-input"
                    required
                  >
                    <option value="">— Select Client —</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.user?.name || '?'})
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
                  <label className="block text-[#95979e] mb-1">Invoice Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    placeholder="29999.00"
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
                className="btn-pill-primary w-full py-2.5 text-xs mt-2 flex items-center justify-center space-x-2"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{submitting ? 'Issuing Invoice…' : 'Issue Invoice'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
