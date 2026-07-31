import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../services/api';
import { OrbLoader } from '../OrbLoader';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Layers, 
  DollarSign, 
  Briefcase, 
  CheckCircle2, 
  X,
  RefreshCw,
  Star,
  Globe,
  Tag,
  Eye,
  EyeOff,
  Settings,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Github,
  MessageCircle
} from 'lucide-react';

export const CatalogManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'pricing' | 'portfolio'>('services');

  // Data state
  const [services, setServices] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Site Contact & Social Media Settings State
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [siteSettingsForm, setSiteSettingsForm] = useState({
    supportEmail: 'support@platepixel.com',
    supportPhone: '+1 (555) 019-2831',
    officeLocation: 'San Francisco & Remote Worldwide',
    twitterUrl: 'https://x.com/platepixel',
    twitterVisible: true,
    facebookUrl: 'https://facebook.com/platepixel',
    facebookVisible: true,
    instagramUrl: 'https://instagram.com/platepixel',
    instagramVisible: true,
    githubUrl: 'https://github.com/platepixelagency',
    githubVisible: true,
    whatsappUrl: 'https://wa.me/15550192831',
    whatsappVisible: true,
    showSocialBar: true,
  });

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showHeroModal, setShowHeroModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [heroForm, setHeroForm] = useState({
    clientProjects: '24 Active',
    leadCrmWon: '₹14,85,000',
    maintenanceRenewals: '98% On Time',
    leadsGenerated: '100+',
    activeRetainers: '30+',
    uptimeSecurity: '99.9%',
    onTimeDelivery: '100%',
  });

  // Forms state
  const [newService, setNewService] = useState({
    title: '',
    category: 'Website Development',
    price: '₹14,999',
    description: '',
    features: '',
    isPopular: false,
  });

  const [newPricing, setNewPricing] = useState({
    title: '',
    price: '₹14,999',
    period: 'one-time',
    description: '',
    features: '',
    highlighted: false,
  });

  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    category: 'Web Application',
    clientName: '',
    imageUrl: '',
    liveUrl: '#',
    tags: '',
  });

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      const [servRes, priceRes, portRes, heroRes, settingsRes] = await Promise.allSettled([
        fetchWithAuth<{ services?: any[] }>('/catalog/services'),
        fetchWithAuth<{ pricing?: any[] }>('/catalog/pricing'),
        fetchWithAuth<{ portfolio?: any[] }>('/catalog/portfolio'),
        fetchWithAuth<{ stats?: any }>('/catalog/hero-stats'),
        fetchWithAuth<{ settings?: any }>('/catalog/site-settings'),
      ]);

      if (servRes.status === 'fulfilled' && servRes.value?.services) setServices(servRes.value.services);
      if (priceRes.status === 'fulfilled' && priceRes.value?.pricing) setPricing(priceRes.value.pricing);
      if (portRes.status === 'fulfilled' && portRes.value?.portfolio) setPortfolio(portRes.value.portfolio);
      if (heroRes.status === 'fulfilled' && heroRes.value?.stats) setHeroForm(heroRes.value.stats);
      if (settingsRes.status === 'fulfilled' && settingsRes.value?.settings) setSiteSettingsForm(settingsRes.value.settings);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithAuth('/catalog/site-settings', {
        method: 'POST',
        body: JSON.stringify(siteSettingsForm),
      });
      alert('Support contact details & social media settings updated successfully!');
      setShowSettingsModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update site settings');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveHeroStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithAuth('/catalog/hero-stats', {
        method: 'POST',
        body: JSON.stringify(heroForm),
      });
      alert('Homepage Live Demo Preview Stats updated successfully!');
      setShowHeroModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update hero stats');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // --- SAVE / EDIT SERVICE ---
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingItem ? `/catalog/services/${editingItem.id}` : '/catalog/services';
      const method = editingItem ? 'PUT' : 'POST';

      await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(newService),
      });

      setShowAddModal(false);
      setEditingItem(null);
      setNewService({ title: '', category: 'Website Development', price: '$499', description: '', features: '', isPopular: false });
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  // --- SAVE / EDIT PRICING ---
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingItem ? `/catalog/pricing/${editingItem.id}` : '/catalog/pricing';
      const method = editingItem ? 'PUT' : 'POST';

      await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(newPricing),
      });

      setShowAddModal(false);
      setEditingItem(null);
      setNewPricing({ title: '', price: '$499', period: 'one-time', description: '', features: '', highlighted: false });
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Failed to save pricing plan');
    } finally {
      setSubmitting(false);
    }
  };

  // --- SAVE / EDIT PORTFOLIO ---
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingItem ? `/catalog/portfolio/${editingItem.id}` : '/catalog/portfolio';
      const method = editingItem ? 'PUT' : 'POST';

      await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(newPortfolio),
      });

      setShowAddModal(false);
      setEditingItem(null);
      setNewPortfolio({ title: '', category: 'Web Application', clientName: '', imageUrl: '', liveUrl: '#', tags: '' });
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Failed to save portfolio project');
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

  // Open Edit Dialog
  const openEditModal = (type: 'services' | 'pricing' | 'portfolio', item: any) => {
    setEditingItem(item);
    if (type === 'services') {
      setNewService({
        title: item.title,
        category: item.category,
        price: item.price,
        description: item.description,
        features: item.features,
        isPopular: item.isPopular,
      });
    } else if (type === 'pricing') {
      setNewPricing({
        title: item.title,
        price: item.price,
        period: item.period,
        description: item.description,
        features: item.features,
        highlighted: item.highlighted,
      });
    } else if (type === 'portfolio') {
      setNewPortfolio({
        title: item.title,
        category: item.category,
        clientName: item.clientName,
        imageUrl: item.imageUrl,
        liveUrl: item.liveUrl,
        tags: item.tags,
      });
    }
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setNewService({ title: '', category: 'Website Development', price: '$499', description: '', features: '', isPopular: false });
    setNewPricing({ title: '', price: '$499', period: 'one-time', description: '', features: '', highlighted: false });
    setNewPortfolio({ title: '', category: 'Web Application', clientName: '', imageUrl: '', liveUrl: '#', tags: '' });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-[10px] uppercase">Catalog Content Engine</span>
            <span className="text-xs text-[#95979e] font-mono">Live Sync with Public Website</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Services, Pricing & Portfolio Manager</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="btn-pill-secondary text-xs py-2 px-3 flex items-center space-x-1.5 border-purple-500/40 text-purple-400"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Support & Social Media Links</span>
          </button>

          <button
            onClick={() => setShowHeroModal(true)}
            className="btn-pill-secondary text-xs py-2 px-3 flex items-center space-x-1.5 border-[#5683da]/40 text-[#5683da]"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Home Live Demo Banner</span>
          </button>

          <button
            onClick={loadCatalogData}
            className="btn-pill-secondary text-xs py-2 px-3 flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Data</span>
          </button>

          <button
            onClick={openAddModal}
            className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {activeSubTab === 'services' ? 'Service' : activeSubTab === 'pricing' ? 'Pricing Plan' : 'Portfolio Project'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-3 border-b border-[#4a4b50]/40 pb-3 overflow-x-auto">
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

      {loading ? (
        <OrbLoader label="Loading Catalog Engine..." size="md" />
      ) : (
        <>
          {/* SUB-TAB 1: SERVICES MANAGER */}
      {activeSubTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => (
            <div key={s.id} className="huly-card p-6 flex flex-col justify-between space-y-4 relative border-[#4a4b50]/60">
              <div className="flex items-center space-x-2 absolute top-4 right-4">
                <button
                  onClick={() => openEditModal('services', s)}
                  className="p-1.5 rounded-lg bg-[#5683da]/10 text-[#5683da] hover:bg-[#5683da]/20 text-xs flex items-center space-x-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px]">EDIT</span>
                </button>
                <button
                  onClick={() => handleDeleteItem('services', s.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="tag-pill bg-[#5683da]/20 text-[#5683da]">{s.category}</span>
                  {s.isPopular && <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964] flex items-center space-x-1"><Star className="w-3 h-3 text-[#ff8964]" /><span>POPULAR</span></span>}
                </div>
                <h3 className="font-bold text-xl text-white pr-20">{s.title}</h3>
                <p className="text-xs text-[#95979e] mt-2 leading-relaxed">{s.description}</p>
              </div>

              {s.features && (
                <div className="space-y-1.5 pt-3 border-t border-[#4a4b50]/40">
                  <span className="text-[10px] text-[#95979e] uppercase font-mono block">Included Key Features:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {s.features.split(',').map((f: string, i: number) => (
                      <span key={i} className="tag-pill bg-[#090a0c] border border-[#4a4b50]/40 text-[#d1d1d1] text-[11px]">
                        ✓ {f.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#4a4b50]/40 flex items-center justify-between text-xs">
                <span className="text-[#95979e] font-mono">Pricing Tier:</span>
                <span className="font-mono font-bold text-emerald-400 text-base">{s.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: PRICING MANAGER */}
      {activeSubTab === 'pricing' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.map((p) => (
            <div key={p.id} className={`huly-card p-6 flex flex-col justify-between space-y-4 relative ${p.highlighted ? 'border-[#5683da] bg-[#5683da]/5' : ''}`}>
              <div className="flex items-center space-x-2 absolute top-4 right-4">
                <button
                  onClick={() => openEditModal('pricing', p)}
                  className="p-1.5 rounded-lg bg-[#5683da]/10 text-[#5683da] hover:bg-[#5683da]/20 text-xs flex items-center space-x-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px]">EDIT</span>
                </button>
                <button
                  onClick={() => handleDeleteItem('pricing', p.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                {p.highlighted && <span className="tag-pill bg-[#5683da]/20 text-[#5683da] mb-2 inline-block">HIGHLIGHTED PLAN</span>}
                <h3 className="font-bold text-2xl text-white pr-20">{p.title}</h3>
                <div className="text-3xl font-extrabold text-white font-mono mt-2">
                  {p.price} <span className="text-xs text-[#95979e] font-normal">/{p.period}</span>
                </div>
                <p className="text-xs text-[#95979e] mt-2 leading-relaxed">{p.description}</p>
              </div>

              {p.features && (
                <div className="space-y-2 pt-3 border-t border-[#4a4b50]/40 text-xs">
                  <span className="text-[10px] text-[#95979e] uppercase font-mono block">Plan Inclusions:</span>
                  {p.features.split(',').map((f: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2 text-[#d1d1d1] text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{f.trim()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: PORTFOLIO MANAGER */}
      {activeSubTab === 'portfolio' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portfolio.map((port) => (
            <div key={port.id} className="huly-card overflow-hidden flex flex-col justify-between relative group">
              <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
                <button
                  onClick={() => openEditModal('portfolio', port)}
                  className="p-1.5 rounded-full bg-black/80 text-[#5683da] hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem('portfolio', port.id)}
                  className="p-1.5 rounded-full bg-black/80 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <img src={port.imageUrl} alt={port.title} className="w-full h-44 object-cover" />

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="tag-pill bg-purple-500/20 text-purple-400 text-[10px]">{port.category}</span>
                  <span className="text-[10px] text-[#95979e] font-mono">{port.clientName}</span>
                </div>
                <h3 className="font-bold text-lg text-white">{port.title}</h3>

                {port.tags && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {port.tags.split(',').map((t: string, i: number) => (
                      <span key={i} className="text-[10px] font-mono text-[#5683da] bg-[#5683da]/10 px-2 py-0.5 rounded">
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-lg w-full p-6 md:p-8 space-y-4 relative border-[#5683da]/50">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingItem(null);
              }}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">
              {editingItem ? 'Edit & Update' : 'Add New'}{' '}
              {activeSubTab === 'services' ? 'Service Offering' : activeSubTab === 'pricing' ? 'Pricing Package' : 'Portfolio Project'}
            </h3>

            {/* FORM: SERVICES */}
            {activeSubTab === 'services' && (
              <form onSubmit={handleSaveService} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#95979e] mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    placeholder="Restaurant Website & QR Menu"
                    className="huly-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#95979e] mb-1">Category</label>
                    <input
                      type="text"
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      placeholder="Food & Hospitality"
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
                      placeholder="$799"
                      className="huly-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Detailed Service Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Complete digital menu portal with dynamic QR code generator, table reservations..."
                    className="huly-input"
                  />
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Key Included Features (Comma Separated)</label>
                  <input
                    type="text"
                    value={newService.features}
                    onChange={(e) => setNewService({ ...newService, features: e.target.value })}
                    placeholder="Digital QR Menu, Dynamic Categories, Table Booking System"
                    className="huly-input"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={newService.isPopular}
                    onChange={(e) => setNewService({ ...newService, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#090a0c] border-[#4a4b50] text-[#5683da]"
                  />
                  <label htmlFor="isPopular" className="text-xs text-white cursor-pointer">
                    Highlight as &quot;Popular Choice&quot; Badge
                  </label>
                </div>

                <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-3 text-xs mt-2">
                  {submitting ? 'Saving Service...' : editingItem ? 'Update Service Changes' : 'Publish Service Offering'}
                </button>
              </form>
            )}

            {/* FORM: PRICING */}
            {activeSubTab === 'pricing' && (
              <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#95979e] mb-1">Pricing Package Title *</label>
                  <input
                    type="text"
                    required
                    value={newPricing.title}
                    onChange={(e) => setNewPricing({ ...newPricing, title: e.target.value })}
                    placeholder="Growth Retainer"
                    className="huly-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#95979e] mb-1">Price Tag *</label>
                    <input
                      type="text"
                      required
                      value={newPricing.price}
                      onChange={(e) => setNewPricing({ ...newPricing, price: e.target.value })}
                      placeholder="$99"
                      className="huly-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[#95979e] mb-1">Billing Cycle Period</label>
                    <input
                      type="text"
                      value={newPricing.period}
                      onChange={(e) => setNewPricing({ ...newPricing, period: e.target.value })}
                      placeholder="per month / one-time"
                      className="huly-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Package Summary Description</label>
                  <textarea
                    rows={3}
                    value={newPricing.description}
                    onChange={(e) => setNewPricing({ ...newPricing, description: e.target.value })}
                    placeholder="Hands-off website maintenance, hosting, updates..."
                    className="huly-input"
                  />
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Included Features List (Comma Separated)</label>
                  <input
                    type="text"
                    value={newPricing.features}
                    onChange={(e) => setNewPricing({ ...newPricing, features: e.target.value })}
                    placeholder="Managed Web Hosting, SSL Certificate, Unlimited Content Edits, 24/7 Support"
                    className="huly-input"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="highlighted"
                    checked={newPricing.highlighted}
                    onChange={(e) => setNewPricing({ ...newPricing, highlighted: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#090a0c] border-[#4a4b50] text-[#5683da]"
                  />
                  <label htmlFor="highlighted" className="text-xs text-white cursor-pointer">
                    Highlight Package as &quot;Most Popular Plan&quot;
                  </label>
                </div>

                <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-3 text-xs mt-2">
                  {submitting ? 'Saving Pricing Plan...' : editingItem ? 'Update Pricing Plan' : 'Publish Pricing Package'}
                </button>
              </form>
            )}

            {/* FORM: PORTFOLIO */}
            {activeSubTab === 'portfolio' && (
              <form onSubmit={handleSavePortfolio} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#95979e] mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                    placeholder="Apex Culinary Group Portal"
                    className="huly-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#95979e] mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={newPortfolio.clientName}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, clientName: e.target.value })}
                      placeholder="Apex Culinary Group"
                      className="huly-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[#95979e] mb-1">Category</label>
                    <input
                      type="text"
                      value={newPortfolio.category}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, category: e.target.value })}
                      placeholder="Restaurant & Hospitality"
                      className="huly-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Image Thumbnail URL *</label>
                  <input
                    type="text"
                    required
                    value={newPortfolio.imageUrl}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
                    className="huly-input"
                  />
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Tech Stack Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={newPortfolio.tags}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, tags: e.target.value })}
                    placeholder="React, Node.js, QR Menu, Table Booking"
                    className="huly-input"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-3 text-xs mt-2">
                  {submitting ? 'Saving Portfolio Project...' : editingItem ? 'Update Portfolio Showcase' : 'Publish Portfolio Showcase'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDIT HOMEPAGE HERO BANNER PREVIEW */}
      {showHeroModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 md:p-8 space-y-4 relative border-[#5683da]/50">
            <button onClick={() => setShowHeroModal(false)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Edit Home Live Demo Preview</h3>
            <p className="text-xs text-[#95979e]">Customize the values shown on the platepixel.agency/workspace/dashboard preview card on the homepage.</p>

            <form onSubmit={handleSaveHeroStats} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">CLIENT PROJECTS Metric Value *</label>
                <input
                  type="text"
                  required
                  value={heroForm.clientProjects}
                  onChange={(e) => setHeroForm({ ...heroForm, clientProjects: e.target.value })}
                  placeholder="24 Active"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">LEAD CRM WON Metric Value *</label>
                <input
                  type="text"
                  required
                  value={heroForm.leadCrmWon}
                  onChange={(e) => setHeroForm({ ...heroForm, leadCrmWon: e.target.value })}
                  placeholder="$48,500"
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">MAINTENANCE RENEWALS Metric Value *</label>
                <input
                  type="text"
                  required
                  value={heroForm.maintenanceRenewals}
                  onChange={(e) => setHeroForm({ ...heroForm, maintenanceRenewals: e.target.value })}
                  placeholder="98% On Time"
                  className="huly-input"
                />
              </div>

              {/* Homepage Metrics Banner Section */}
              <div className="pt-3 border-t border-[#4a4b50]/40 space-y-3">
                <h4 className="font-mono text-white text-xs uppercase tracking-wider text-[#5683da]">Homepage Metrics Banner Stat Numbers</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#95979e] mb-1">LEADS GENERATED *</label>
                    <input
                      type="text"
                      required
                      value={heroForm.leadsGenerated || '100+'}
                      onChange={(e) => setHeroForm({ ...heroForm, leadsGenerated: e.target.value })}
                      placeholder="100+"
                      className="huly-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#95979e] mb-1">ACTIVE RETAINERS *</label>
                    <input
                      type="text"
                      required
                      value={heroForm.activeRetainers || '30+'}
                      onChange={(e) => setHeroForm({ ...heroForm, activeRetainers: e.target.value })}
                      placeholder="30+"
                      className="huly-input font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#95979e] mb-1">UPTIME & SECURITY *</label>
                    <input
                      type="text"
                      required
                      value={heroForm.uptimeSecurity || '99.9%'}
                      onChange={(e) => setHeroForm({ ...heroForm, uptimeSecurity: e.target.value })}
                      placeholder="99.9%"
                      className="huly-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#95979e] mb-1">ON-TIME DELIVERY *</label>
                    <input
                      type="text"
                      required
                      value={heroForm.onTimeDelivery || '100%'}
                      onChange={(e) => setHeroForm({ ...heroForm, onTimeDelivery: e.target.value })}
                      placeholder="100%"
                      className="huly-input font-mono"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-3 text-xs mt-2">
                {submitting ? 'Saving Live Hero & Banner Stats...' : 'Save Live Hero & Banner Stats'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLIENT SUPPORT & SOCIAL MEDIA CONTROLS */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-xl w-full p-6 md:p-8 space-y-5 relative max-h-[90vh] overflow-y-auto border-purple-500/50">
            <button onClick={() => setShowSettingsModal(false)} className="absolute top-4 right-4 text-[#95979e] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Client Support & Social Media Manager</span>
              </h3>
              <p className="text-xs text-[#95979e]">Edit support hotline, contact email, and toggle social media icon visibility on the website footer.</p>
            </div>

            <form onSubmit={handleSaveSiteSettings} className="space-y-4 text-xs">
              {/* SECTION 1: CLIENT SUPPORT CONTACT DETAILS */}
              <div className="p-4 bg-[#090a0c] border border-[#4a4b50]/50 rounded-xl space-y-3">
                <h4 className="font-mono text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-[#5683da]" />
                  <span>Client Support Contact Information</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#95979e] mb-1">Support Email Address *</label>
                    <input
                      type="email"
                      required
                      value={siteSettingsForm.supportEmail}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, supportEmail: e.target.value })}
                      placeholder="support@platepixel.com"
                      className="huly-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[#95979e] mb-1">Support Phone / Hotline *</label>
                    <input
                      type="text"
                      required
                      value={siteSettingsForm.supportPhone}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, supportPhone: e.target.value })}
                      placeholder="+1 (555) 019-2831"
                      className="huly-input"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SOCIAL MEDIA LINKS & EYE HIDE/UNHIDE TOGGLES */}
              <div className="p-4 bg-[#090a0c] border border-[#4a4b50]/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-[#ff8964]" />
                    <span>Footer Social Media Icons & Visibility Toggles</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => setSiteSettingsForm({ ...siteSettingsForm, showSocialBar: !siteSettingsForm.showSocialBar })}
                    className={`px-3 py-1 rounded-full text-[11px] font-mono flex items-center space-x-1 border transition-all ${
                      siteSettingsForm.showSocialBar
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {siteSettingsForm.showSocialBar ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{siteSettingsForm.showSocialBar ? 'Social Bar Visible' : 'Social Bar Hidden'}</span>
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Twitter / X */}
                  <div className="flex items-center space-x-2">
                    <div className="w-24 text-[11px] font-mono text-white flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5 text-[#5683da]" />
                      <span>X / Twitter</span>
                    </div>
                    <input
                      type="text"
                      value={siteSettingsForm.twitterUrl}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, twitterUrl: e.target.value })}
                      placeholder="https://x.com/platepixel"
                      className="huly-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setSiteSettingsForm({ ...siteSettingsForm, twitterVisible: !siteSettingsForm.twitterVisible })}
                      className={`p-2 rounded-lg border ${siteSettingsForm.twitterVisible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                      title={siteSettingsForm.twitterVisible ? 'Visible on Footer' : 'Hidden from Footer'}
                    >
                      {siteSettingsForm.twitterVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Facebook */}
                  <div className="flex items-center space-x-2">
                    <div className="w-24 text-[11px] font-mono text-white flex items-center space-x-1">
                      <Facebook className="w-3.5 h-3.5 text-blue-400" />
                      <span>Facebook</span>
                    </div>
                    <input
                      type="text"
                      value={siteSettingsForm.facebookUrl}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/platepixel"
                      className="huly-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setSiteSettingsForm({ ...siteSettingsForm, facebookVisible: !siteSettingsForm.facebookVisible })}
                      className={`p-2 rounded-lg border ${siteSettingsForm.facebookVisible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                      title={siteSettingsForm.facebookVisible ? 'Visible on Footer' : 'Hidden from Footer'}
                    >
                      {siteSettingsForm.facebookVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-center space-x-2">
                    <div className="w-24 text-[11px] font-mono text-white flex items-center space-x-1">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      <span>Instagram</span>
                    </div>
                    <input
                      type="text"
                      value={siteSettingsForm.instagramUrl}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/platepixel"
                      className="huly-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setSiteSettingsForm({ ...siteSettingsForm, instagramVisible: !siteSettingsForm.instagramVisible })}
                      className={`p-2 rounded-lg border ${siteSettingsForm.instagramVisible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                      title={siteSettingsForm.instagramVisible ? 'Visible on Footer' : 'Hidden from Footer'}
                    >
                      {siteSettingsForm.instagramVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* GitHub */}
                  <div className="flex items-center space-x-2">
                    <div className="w-24 text-[11px] font-mono text-white flex items-center space-x-1">
                      <Github className="w-3.5 h-3.5 text-purple-400" />
                      <span>GitHub</span>
                    </div>
                    <input
                      type="text"
                      value={siteSettingsForm.githubUrl}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, githubUrl: e.target.value })}
                      placeholder="https://github.com/platepixelagency"
                      className="huly-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setSiteSettingsForm({ ...siteSettingsForm, githubVisible: !siteSettingsForm.githubVisible })}
                      className={`p-2 rounded-lg border ${siteSettingsForm.githubVisible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                      title={siteSettingsForm.githubVisible ? 'Visible on Footer' : 'Hidden from Footer'}
                    >
                      {siteSettingsForm.githubVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center space-x-2">
                    <div className="w-24 text-[11px] font-mono text-white flex items-center space-x-1">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </div>
                    <input
                      type="text"
                      value={siteSettingsForm.whatsappUrl}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappUrl: e.target.value })}
                      placeholder="https://wa.me/15550192831"
                      className="huly-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setSiteSettingsForm({ ...siteSettingsForm, whatsappVisible: !siteSettingsForm.whatsappVisible })}
                      className={`p-2 rounded-lg border ${siteSettingsForm.whatsappVisible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                      title={siteSettingsForm.whatsappVisible ? 'Visible on Footer' : 'Hidden from Footer'}
                    >
                      {siteSettingsForm.whatsappVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-pill-primary w-full py-3 text-xs bg-purple-500 hover:bg-purple-600 border-none text-white font-bold mt-2">
                {submitting ? 'Saving Site Settings...' : 'Save Support Contact & Social Media Controls'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
