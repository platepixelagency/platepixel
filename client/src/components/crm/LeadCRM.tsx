import React, { useEffect, useState } from 'react';
import { Lead } from '../../types';
import { fetchWithAuth } from '../../services/api';
import { supabase, subscribeToRealtimeTable } from '../../services/supabase';
import { 
  Plus, 
  Search, 
  UserCheck, 
  Trash2, 
  Sparkles, 
  Building, 
  Phone, 
  Mail, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
  Filter,
  Eye,
  RefreshCw
} from 'lucide-react';

export const LeadCRM: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [dbError, setDbError] = useState<string>('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [convertedResult, setConvertedResult] = useState<any>(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    businessName: '',
    mobile: '',
    email: '',
    category: 'Website Development',
    service: 'Business Website',
    budget: '$500 - $1,500',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dbServices, setDbServices] = useState<any[]>([]);

  const loadServices = async () => {
    try {
      // Direct Supabase fetch for services
      const { data } = await supabase.from('agency_services').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setDbServices(data);
        return;
      }
    } catch (e) {}

    // API fallback
    try {
      const res = await fetchWithAuth<{ services: any[] }>('/catalog/services');
      if (res.services && res.services.length > 0) {
        setDbServices(res.services);
      }
    } catch (e) {}
  };

  const mapSupabaseLead = (l: any): Lead => ({
    id: l.id,
    name: l.name || '',
    businessName: l.business_name || l.businessName || `${l.name}'s Business`,
    mobile: l.mobile || '',
    email: l.email || '',
    category: l.category || 'General',
    service: l.service || '',
    budget: l.budget || 'Not Specified',
    message: l.message || '',
    status: l.status || 'NEW',
    createdAt: l.created_at || l.createdAt || new Date().toISOString(),
  });

  const loadLeads = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setDbError('');

      // ✅ PRIMARY: Direct Supabase fetch
      const { data: supaLeads, error: supaErr } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[LeadCRM] Supabase fetch:', { count: supaLeads?.length, error: supaErr?.message, status: supaErr?.code });

      if (supaErr) {
        console.warn('[LeadCRM] Supabase error:', supaErr.message, supaErr.code);
        // Don't return — fall through to API
      }

      if (supaLeads && supaLeads.length > 0) {
        setLeads(supaLeads.map(mapSupabaseLead));
        if (!silent) setLoading(false);
        return;
      }

      // 🔄 FALLBACK: API server fetch (when Supabase returns empty or errors)
      try {
        console.log('[LeadCRM] Trying API fallback...');
        const res = await fetchWithAuth<{ leads: Lead[] }>('/leads');
        console.log('[LeadCRM] API response:', { count: res.leads?.length });
        if (res.leads && res.leads.length > 0) {
          setLeads(res.leads);
          if (!silent) setLoading(false);
          return;
        }
      } catch (apiErr: any) {
        console.warn('[LeadCRM] API fallback error:', apiErr.message);
        // Show error only if supabase also failed
        if (supaErr) {
          setDbError(`DB Error: ${supaErr.message}. Server also offline. Check RLS policies or server status.`);
        } else if (!supaLeads || supaLeads.length === 0) {
          setDbError('No leads found. If leads exist, check Supabase Row Level Security (RLS) policies for the leads table.');
        }
      }

      // Both empty — preserve existing list on silent refresh, show empty on first load
      if (!silent) {
        if (!supaErr && supaLeads !== null) {
          setLeads([]); // Actually empty DB
        }
        // else keep existing leads shown while errors persist
      }
    } catch (err: any) {
      console.error('[LeadCRM] Fatal error:', err);
      if (!silent) setDbError(`Connection failed: ${err.message}`);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    loadServices();
    const leadChannel = subscribeToRealtimeTable('leads', () => loadLeads(true));
    const serviceChannel = subscribeToRealtimeTable('agency_services', () => loadServices());
    const intervalId = setInterval(() => loadLeads(true), 10000);

    return () => {
      leadChannel.unsubscribe();
      serviceChannel.unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await fetchWithAuth('/leads', {
        method: 'POST',
        body: JSON.stringify(newLead),
      });

      setShowAddModal(false);
      setNewLead({
        name: '',
        businessName: '',
        mobile: '',
        email: '',
        category: 'Website Development',
        service: 'Business Website',
        budget: '$500 - $1,500',
        message: '',
      });
      loadLeads(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    // 1. Optimistic UI update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus as any } : l));
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => (prev ? { ...prev, status: newStatus as any } : null));
    }

    try {
      // ✅ PRIMARY: Direct Supabase update
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
      if (error) throw new Error(error.message);
    } catch (err: any) {
      // Fallback to API
      try {
        await fetchWithAuth(`/leads/${leadId}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      } catch (apiErr: any) {
        alert(apiErr.message || 'Failed to update status');
        loadLeads(true); // revert optimistic update
      }
    }
  };

  const handleConvertLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    try {
      // ✅ PRIMARY: Direct Supabase convert
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const clientId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const defaultPassword = `PlatePixel@${Math.floor(1000 + Math.random() * 9000)}`;
      const renewal = new Date(Date.now() + 365 * 86400000).toISOString();

      await supabase.from('portal_clients').upsert({ id: userId, name: lead.name, email: lead.email, password: defaultPassword, company_name: lead.businessName || `${lead.name}'s Business`, phone: lead.mobile || '', role: 'CLIENT' });
      await supabase.from('users').upsert({ id: userId, name: lead.name, email: lead.email, password: defaultPassword, role: 'CLIENT' });
      await supabase.from('clients').insert({ id: clientId, user_id: userId, company_name: lead.businessName || `${lead.name}'s Business`, phone: lead.mobile || '', address: '', renewal_date: renewal });
      await supabase.from('leads').update({ status: 'WON' }).eq('id', leadId);

      setConvertedResult({ message: 'Lead converted!', userCredentials: { email: lead.email, temporaryPassword: defaultPassword } });
      setSelectedLead(null);
      loadLeads();
    } catch (err: any) {
      // Fallback to API
      try {
        const data = await fetchWithAuth<any>(`/leads/${leadId}/convert`, { method: 'POST' });
        setConvertedResult(data);
        loadLeads();
      } catch (apiErr: any) {
        alert(apiErr.message || 'Failed to convert lead to client');
      }
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead record?')) return;
    try {
      // ✅ PRIMARY: Direct Supabase delete
      await supabase.from('leads').delete().eq('id', leadId);
      setSelectedLead(null);
      loadLeads();
    } catch (err: any) {
      // Fallback to API
      try {
        await fetchWithAuth(`/leads/${leadId}`, { method: 'DELETE' });
        setSelectedLead(null);
        loadLeads();
      } catch (apiErr: any) {
        alert(apiErr.message || 'Failed to delete lead');
      }
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.businessName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.service.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="tag-pill bg-blue-500/20 text-blue-400 border border-blue-500/30">NEW</span>;
      case 'CONTACTED':
        return <span className="tag-pill bg-purple-500/20 text-purple-400 border border-purple-500/30">CONTACTED</span>;
      case 'PROPOSAL_SENT':
        return <span className="tag-pill bg-amber-500/20 text-amber-400 border border-amber-500/30">PROPOSAL SENT</span>;
      case 'WON':
        return <span className="tag-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">WON (CLIENT)</span>;
      case 'LOST':
        return <span className="tag-pill bg-red-500/20 text-red-400 border border-red-500/30">LOST</span>;
      default:
        return <span className="tag-pill bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  const pipelineColumns = [
    { key: 'NEW', title: 'New Leads', color: 'border-blue-500/40 text-blue-400' },
    { key: 'CONTACTED', title: 'Contacted', color: 'border-purple-500/40 text-purple-400' },
    { key: 'PROPOSAL_SENT', title: 'Proposal Sent', color: 'border-amber-500/40 text-amber-400' },
    { key: 'WON', title: 'Won (Converted)', color: 'border-emerald-500/40 text-emerald-400' },
    { key: 'LOST', title: 'Lost', color: 'border-red-500/40 text-red-400' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#5683da] border-t-transparent animate-spin" />
        <p className="text-xs text-[#95979e] font-mono">Loading leads from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* DB Error Banner */}
      {dbError && (
        <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{dbError}</span>
          <button
            onClick={() => loadLeads()}
            className="ml-auto flex items-center space-x-1 text-red-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-[10px] uppercase">CRM Pipeline</span>
            <span className="text-xs text-[#95979e] font-mono">{leads.length} Total Leads Captured</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Lead Management Hub</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadLeads()}
            title="Refresh leads"
            className="w-8 h-8 rounded-full bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white hover:border-[#5683da] flex items-center justify-center transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center bg-[#090a0c] border border-[#4a4b50] rounded-full p-1 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-full transition-all ${viewMode === 'kanban' ? 'bg-[#5683da] text-white font-medium' : 'text-[#95979e]'}`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-full transition-all ${viewMode === 'table' ? 'bg-[#5683da] text-white font-medium' : 'text-[#95979e]'}`}
            >
              Table List
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, business, service..."
            className="huly-input huly-input-icon"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#95979e]" />
          {['ALL', 'NEW', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`tag-pill text-xs py-1.5 px-3 whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-[#5683da] text-white font-semibold'
                  : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pipelineColumns.map(col => {
            const columnLeads = filteredLeads.filter(l => l.status === col.key);
            return (
              <div key={col.key} className="bg-[#111111]/70 border border-[#4a4b50]/60 rounded-xl p-4 min-h-[500px] flex flex-col">
                <div className={`flex items-center justify-between pb-3 mb-3 border-b ${col.color}`}>
                  <span className="font-bold text-xs uppercase font-mono tracking-wider text-white">{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-[#090a0c] text-xs font-mono text-[#95979e] flex items-center justify-center font-bold">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnLeads.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#95979e]/60 font-mono">No leads</div>
                  ) : (
                    columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="bg-[#090a0c] border border-[#4a4b50] hover:border-[#5683da] rounded-xl p-4 cursor-pointer transition-all space-y-2 group shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-sm text-white group-hover:text-[#5683da] transition-colors">
                            {lead.name}
                          </h4>
                          {getStatusBadge(lead.status)}
                        </div>

                        <div className="text-xs text-[#ff8964] font-medium flex items-center space-x-1">
                          <Building className="w-3 h-3 text-[#95979e]" />
                          <span className="truncate">{lead.businessName}</span>
                        </div>

                        <div className="text-[11px] text-[#95979e] truncate font-mono">
                          {lead.service}
                        </div>

                        <div className="pt-2 border-t border-[#4a4b50]/30 flex items-center justify-between text-[10px] text-[#95979e]">
                          <span>{lead.budget}</span>
                          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="huly-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090a0c] text-[#95979e] uppercase font-mono border-b border-[#4a4b50]/60">
                <tr>
                  <th className="p-4">Lead Name</th>
                  <th className="p-4">Business</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Service Required</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4a4b50]/40">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-[#090a0c]/50 transition-colors">
                    <td className="p-4 font-bold text-white">{lead.name}</td>
                    <td className="p-4 text-[#ff8964] font-medium">{lead.businessName}</td>
                    <td className="p-4 space-y-0.5 text-[#95979e]">
                      <div>{lead.email}</div>
                      <div className="text-[10px] font-mono">{lead.mobile}</div>
                    </td>
                    <td className="p-4 text-[#5683da]">{lead.service}</td>
                    <td className="p-4 font-mono">{lead.budget}</td>
                    <td className="p-4">{getStatusBadge(lead.status)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="btn-pill-secondary py-1 px-3 text-[11px]"
                      >
                        Details
                      </button>
                      {lead.status !== 'WON' && (
                        <button
                          onClick={() => handleConvertLead(lead.id)}
                          className="btn-pill-primary py-1 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-500"
                        >
                          Convert
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Lead Detail View */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-xl w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center font-bold text-lg">
                {selectedLead.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white">{selectedLead.name}</h3>
                  {getStatusBadge(selectedLead.status)}
                </div>
                <p className="text-xs text-[#ff8964] font-medium">{selectedLead.businessName}</p>
              </div>
            </div>

            {/* Lead Meta Card */}
            <div className="grid grid-cols-2 gap-4 bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/50 text-xs">
              <div>
                <span className="text-[#95979e] uppercase font-mono text-[10px] block">Email</span>
                <span className="text-white font-medium">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-[#95979e] uppercase font-mono text-[10px] block">Mobile / WhatsApp</span>
                <span className="text-white font-medium">{selectedLead.mobile}</span>
              </div>
              <div>
                <span className="text-[#95979e] uppercase font-mono text-[10px] block">Service Requested</span>
                <span className="text-[#5683da] font-medium">{selectedLead.service}</span>
              </div>
              <div>
                <span className="text-[#95979e] uppercase font-mono text-[10px] block">Budget</span>
                <span className="text-emerald-400 font-medium font-mono">{selectedLead.budget}</span>
              </div>
            </div>

            {/* Message */}
            <div>
              <span className="text-xs text-[#95979e] uppercase font-mono block mb-1">Lead Message / Request Details</span>
              <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/40 text-xs text-white leading-relaxed">
                {selectedLead.message || 'No additional message provided.'}
              </div>
            </div>

            {/* Quick Status Selector */}
            <div>
              <label className="block text-xs font-mono text-[#95979e] uppercase mb-2">Update Pipeline Status</label>
              <div className="flex flex-wrap gap-2">
                {['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedLead.id, st)}
                    className={`tag-pill text-xs py-1.5 px-3 transition-all ${
                      selectedLead.status === st
                        ? 'bg-[#5683da] text-white font-semibold'
                        : 'bg-[#090a0c] border border-[#4a4b50] text-[#95979e] hover:border-[#5683da]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t border-[#4a4b50]/40 flex items-center justify-between">
              <button
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="text-xs text-red-400 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Lead</span>
              </button>

              {selectedLead.status !== 'WON' && (
                <button
                  onClick={() => handleConvertLead(selectedLead.id)}
                  className="btn-pill-primary py-2 px-5 text-xs bg-emerald-600 hover:bg-emerald-500 flex items-center space-x-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>1-Click Convert to Client</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Converted Credentials Result */}
      {convertedResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 text-center space-y-6 relative border-emerald-500/50">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">Client Created!</h3>
              <p className="text-xs text-[#95979e] mt-1">
                Lead converted to active Client account with portal access.
              </p>
            </div>

            <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/40 text-left text-xs font-mono space-y-2">
              <div className="text-[#95979e]">Company: <span className="text-white font-bold">{convertedResult.client.companyName}</span></div>
              <div className="text-[#95979e]">Portal Login Email: <span className="text-[#5683da]">{convertedResult.userCredentials.email}</span></div>
              <div className="text-[#95979e]">Temp Password: <span className="text-emerald-400 font-bold">{convertedResult.userCredentials.temporaryPassword}</span></div>
              <div className="text-[#95979e]">1-Year Renewal: <span className="text-amber-400">{new Date(convertedResult.client.renewalDate).toLocaleDateString()}</span></div>
            </div>

            <button
              onClick={() => setConvertedResult(null)}
              className="btn-pill-primary w-full py-2.5 text-xs bg-emerald-600 hover:bg-emerald-500"
            >
              Done & Return to CRM
            </button>
          </div>
        </div>
      )}

      {/* Modal: Manual Add Lead Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Log New Lead</h3>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Lead Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="John Smith"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Business Name</label>
                <input
                  type="text"
                  value={newLead.businessName}
                  onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
                  placeholder="Smith Bakery"
                  className="huly-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#95979e] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="john@smith.com"
                    className="huly-input"
                  />
                </div>
                <div>
                  <label className="block text-[#95979e] mb-1">Mobile / Phone *</label>
                  <input
                    type="text"
                    required
                    value={newLead.mobile}
                    onChange={(e) => setNewLead({ ...newLead, mobile: e.target.value })}
                    placeholder="+1 555-0192"
                    className="huly-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Service Required *</label>
                <select
                  value={newLead.service}
                  onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                  className="huly-input"
                >
                  {dbServices.length > 0 ? (
                    dbServices.map((s) => (
                      <option key={s.id || s.title} value={s.title}>
                        {s.title} ({s.price})
                      </option>
                    ))
                  ) : (
                    <option value="">Loading database services...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Notes / Message</label>
                <textarea
                  rows={3}
                  value={newLead.message}
                  onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                  placeholder="Inquiry notes..."
                  className="huly-input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                {submitting ? 'Saving...' : 'Add Lead to CRM'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
