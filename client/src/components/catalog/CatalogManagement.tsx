import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../services/api';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Layers, 
  DollarSign, 
  Briefcase, 
  ExternalLink, 
  CheckCircle2, 
  X,
  Tag
} from 'lucide-react';

export const CatalogManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'pricing' | 'portfolio'>('services');

  // Data state
  const [services, setServices] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Forms state
  const [newService, setNewService] = useState({ title: '', category: 'Web Development', price: '$499', description: '', features: '', isPopular: false });
  const [newPricing, setNewPricing] = useState({ title: '', price: '$499', period: 'one-time', description: '', features: '', highlighted: false });
  const [newPortfolio, setNewPortfolio] = useState({ title: '', category: 'Web Application', clientName: '', imageUrl: '', liveUrl: '#', tags: '' });

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      const [servRes, priceRes, portRes] = await Promise.all([
        fetch('/api/catalog/services').then(r => r.json()),
        fetch('/api/catalog/pricing').then(r => r.json()),
        fetch('/api/catalog/portfolio').then(r => r.json()),
      ]);
      setServices(servRes.services || []);
      setPricing(priceRes.pricing || []);
      setPortfolio(portRes.portfolio || []);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithAuth('/catalog/services', {
        method: 'POST',
        body: JSON.stringify(newService),
      });
      setShowAddModal(false);
      setNewService({ title: '', category: 'Web Development', price: '$499', description: '', features: '', isPopular: false });
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithAuth('/catalog/pricing', {
        method: 'POST',
        body: JSON.stringify(newPricing),
      });
      setShowAddModal(false);
      setNewPricing({ title: '', price: '$499', period: 'one-time', description: '', features: '', highlighted: false });
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Failed to create pricing plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithAuth('/catalog/portfolio', {
        method: 'POST',
        body: JSON.stringify(newPortfolio),
      });
      setShowAddModal(false);
      setNewPortfolio({ title: '', category: 'Web Application', clientName: '', imageUrl: '', liveUrl: '#', tags: '' });
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Failed to create portfolio item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (type: 'services' | 'pricing' | 'portfolio', id: string) => {
    if (!confirm('Are you sure you want to delete this catalog item?')) return;
    try {
      await fetchWithAuth(`/catalog/${type}/${id}`, { method: 'DELETE' });
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete catalog item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-[10px] uppercase">Agency Catalog Manager</span>
            <span className="text-xs text-[#95979e] font-mono">Manage Website Content & Offerings</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Services, Pricing & Portfolio Manager</h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5 whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeSubTab === 'services' ? 'Service' : activeSubTab === 'pricing' ? 'Pricing Plan' : 'Portfolio Project'}</span>
        </button>
      </div>

      {/* Sub-Navigation */}
      <div className="flex items-center space-x-3 border-b border-[#4a4b50]/40 pb-3">
        <button
          onClick={() => setActiveSubTab('services')}
          className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
            activeSubTab === 'services'
              ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
              : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-[#ff8964]" />
          <span>Agency Services ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pricing')}
          className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
            activeSubTab === 'pricing'
              ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
              : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Pricing Packages ({pricing.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('portfolio')}
          className={`flex items-center space-x-2 py-2 px-5 rounded-full text-xs font-medium transition-all ${
            activeSubTab === 'portfolio'
              ? 'bg-[#5683da] text-white shadow-lg shadow-[#5683da]/20'
              : 'bg-[#111111] border border-[#4a4b50] text-[#95979e] hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4 text-purple-400" />
          <span>Portfolio Showcase ({portfolio.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: SERVICES MANAGER */}
      {activeSubTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.length === 0 ? (
            <div className="col-span-3 huly-card p-12 text-center text-[#95979e]">
              No custom services added yet. Click &quot;Add New Service&quot; above.
            </div>
          ) : (
            services.map(s => (
              <div key={s.id} className="huly-card p-6 flex flex-col justify-between space-y-4 relative">
                <button
                  onClick={() => handleDeleteItem('services', s.id)}
                  className="absolute top-4 right-4 text-red-400 hover:text-red-300 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="tag-pill bg-[#5683da]/20 text-[#5683da]">{s.category}</span>
                    {s.isPopular && <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964]">POPULAR</span>}
                  </div>
                  <h3 className="font-bold text-lg text-white">{s.title}</h3>
                  <p className="text-xs text-[#95979e] mt-1 line-clamp-2">{s.description}</p>
                </div>

                <div className="pt-3 border-t border-[#4a4b50]/40 flex items-center justify-between text-xs">
                  <span className="text-[#95979e] font-mono">Price Tag:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{s.price}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-TAB 2: PRICING MANAGER */}
      {activeSubTab === 'pricing' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.length === 0 ? (
            <div className="col-span-3 huly-card p-12 text-center text-[#95979e]">
              No custom pricing plans added yet. Click &quot;Add New Pricing Plan&quot; above.
            </div>
          ) : (
            pricing.map(p => (
              <div key={p.id} className="huly-card p-6 flex flex-col justify-between space-y-4 relative">
                <button
                  onClick={() => handleDeleteItem('pricing', p.id)}
                  className="absolute top-4 right-4 text-red-400 hover:text-red-300 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  {p.highlighted && <span className="tag-pill bg-[#5683da]/20 text-[#5683da] mb-2 inline-block">HIGHLIGHTED</span>}
                  <h3 className="font-bold text-xl text-white">{p.title}</h3>
                  <div className="text-2xl font-extrabold text-white font-mono mt-1">
                    {p.price} <span className="text-xs text-[#95979e] font-normal">/{p.period}</span>
                  </div>
                  <p className="text-xs text-[#95979e] mt-2">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-[#4a4b50]/40 text-xs text-[#95979e]">
                  {p.features}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-TAB 3: PORTFOLIO MANAGER */}
      {activeSubTab === 'portfolio' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portfolio.length === 0 ? (
            <div className="col-span-3 huly-card p-12 text-center text-[#95979e]">
              No portfolio projects added yet. Click &quot;Add New Portfolio Project&quot; above.
            </div>
          ) : (
            portfolio.map(port => (
              <div key={port.id} className="huly-card overflow-hidden flex flex-col justify-between relative group">
                <button
                  onClick={() => handleDeleteItem('portfolio', port.id)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/70 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <img src={port.imageUrl} alt={port.title} className="w-full h-40 object-cover" />

                <div className="p-5 space-y-2">
                  <span className="tag-pill bg-purple-500/20 text-purple-400 text-[10px]">{port.category}</span>
                  <h3 className="font-bold text-base text-white">{port.title}</h3>
                  <p className="text-xs text-[#95979e]">Client: {port.clientName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">
              Add New {activeSubTab === 'services' ? 'Service' : activeSubTab === 'pricing' ? 'Pricing Package' : 'Portfolio Showcase Project'}
            </h3>

            {activeSubTab === 'services' && (
              <form onSubmit={handleCreateService} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#95979e] mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    placeholder="Mobile App & PWA Development"
                    className="huly-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#95979e] mb-1">Category</label>
                    <input
                      type="text"
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      placeholder="Web Development"
                      className="huly-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[#95979e] mb-1">Price Tag *</label>
                    <input
                      type="text"
                      required
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder="$799 / project"
                      className="huly-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="High performance progressive web apps..."
                    className="huly-input"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-2.5 text-xs mt-2">
                  {submitting ? 'Creating...' : 'Save Service Offering'}
                </button>
              </form>
            )}

            {activeSubTab === 'pricing' && (
              <form onSubmit={handleCreatePricing} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#95979e] mb-1">Plan Package Title *</label>
                  <input
                    type="text"
                    required
                    value={newPricing.title}
                    onChange={(e) => setNewPricing({ ...newPricing, title: e.target.value })}
                    placeholder="Enterprise Custom Build"
                    className="huly-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#95979e] mb-1">Price *</label>
                    <input
                      type="text"
                      required
                      value={newPricing.price}
                      onChange={(e) => setNewPricing({ ...newPricing, price: e.target.value })}
                      placeholder="$1,499"
                      className="huly-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[#95979e] mb-1">Billing Period</label>
                    <input
                      type="text"
                      value={newPricing.period}
                      onChange={(e) => setNewPricing({ ...newPricing, period: e.target.value })}
                      placeholder="one-time / monthly"
                      className="huly-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newPricing.description}
                    onChange={(e) => setNewPricing({ ...newPricing, description: e.target.value })}
                    placeholder="Complete custom CRM & billing portal..."
                    className="huly-input"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-2.5 text-xs mt-2">
                  {submitting ? 'Creating...' : 'Save Pricing Plan'}
                </button>
              </form>
            )}

            {activeSubTab === 'portfolio' && (
              <form onSubmit={handleCreatePortfolio} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#95979e] mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                    placeholder="Urban Dining QR Portal"
                    className="huly-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#95979e] mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={newPortfolio.clientName}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, clientName: e.target.value })}
                      placeholder="Urban Bistro"
                      className="huly-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[#95979e] mb-1">Category</label>
                    <input
                      type="text"
                      value={newPortfolio.category}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, category: e.target.value })}
                      placeholder="Restaurant & QR"
                      className="huly-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Image URL *</label>
                  <input
                    type="text"
                    required
                    value={newPortfolio.imageUrl}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="huly-input"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-2.5 text-xs mt-2">
                  {submitting ? 'Creating...' : 'Save Portfolio Showcase'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
