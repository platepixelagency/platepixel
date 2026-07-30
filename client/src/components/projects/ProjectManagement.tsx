import React, { useEffect, useState } from 'react';
import { Project, Client } from '../../types';
import { fetchWithAuth } from '../../services/api';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar, 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  X, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ExtendedProject extends Project {
  client: {
    id: string;
    companyName: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<ExtendedProject | null>(null);
  const [editProject, setEditProject] = useState<ExtendedProject | null>(null);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    clientId: '',
    projectName: '',
    status: 'PLANNING',
    deliveryDate: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, clientRes] = await Promise.all([
        fetchWithAuth<{ projects: ExtendedProject[] }>('/projects'),
        fetchWithAuth<{ clients: any[] }>('/clients'),
      ]);
      setProjects(projRes.projects);
      setClients(clientRes.clients);
      if (clientRes.clients.length > 0 && !newProject.clientId) {
        setNewProject(prev => ({ ...prev, clientId: clientRes.clients[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load project management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetchWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify(newProject),
      });

      setShowAddModal(false);
      setNewProject({
        clientId: clients[0]?.id || '',
        projectName: '',
        status: 'PLANNING',
        deliveryDate: '',
        description: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    try {
      await fetchWithAuth(`/projects/${projectId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
      if (selectedProject?.id === projectId) {
        setSelectedProject(prev => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update project status');
    }
  };

  const handleUpdateProjectDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;

    try {
      await fetchWithAuth(`/projects/${editProject.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          projectName: editProject.projectName,
          deliveryDate: editProject.deliveryDate,
          description: editProject.description,
          status: editProject.status,
        }),
      });

      setEditProject(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to edit project details');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await fetchWithAuth(`/projects/${projectId}`, {
        method: 'DELETE',
      });
      setSelectedProject(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.projectName.toLowerCase().includes(search.toLowerCase()) ||
    p.client.companyName.toLowerCase().includes(search.toLowerCase()) ||
    p.client.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return <span className="tag-pill bg-blue-500/20 text-blue-400 border border-blue-500/30">PLANNING</span>;
      case 'DEVELOPMENT':
        return <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964] border border-[#ff8964]/30">DEVELOPMENT</span>;
      case 'TESTING':
        return <span className="tag-pill bg-purple-500/20 text-purple-400 border border-purple-500/30">TESTING</span>;
      case 'DELIVERED':
        return <span className="tag-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">DELIVERED</span>;
      default:
        return <span className="tag-pill bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  const statusColumns = [
    { key: 'PLANNING', title: 'Planning Phase', color: 'border-blue-500/40' },
    { key: 'DEVELOPMENT', title: 'In Development', color: 'border-[#ff8964]/40' },
    { key: 'TESTING', title: 'Testing & QA', color: 'border-purple-500/40' },
    { key: 'DELIVERED', title: 'Delivered / Live', color: 'border-emerald-500/40' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#4a4b50]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-[10px] uppercase">Project Board</span>
            <span className="text-xs text-[#95979e] font-mono">{projects.length} Total Client Projects</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Project & Milestone Management</h2>
        </div>

        <div className="flex items-center space-x-3">
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
              Table View
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-pill-primary text-xs py-2 px-4 flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#95979e]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects or clients..."
          className="huly-input huly-input-icon"
        />
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusColumns.map(col => {
            const colProjects = filteredProjects.filter(p => p.status === col.key);
            return (
              <div key={col.key} className="bg-[#111111]/70 border border-[#4a4b50]/60 rounded-xl p-4 min-h-[500px] flex flex-col">
                <div className={`flex items-center justify-between pb-3 mb-3 border-b ${col.color}`}>
                  <span className="font-bold text-xs uppercase font-mono text-white">{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-[#090a0c] text-xs font-mono text-[#95979e] flex items-center justify-center font-bold">
                    {colProjects.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colProjects.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#95979e]/60 font-mono">No projects</div>
                  ) : (
                    colProjects.map(proj => (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProject(proj)}
                        className="bg-[#090a0c] border border-[#4a4b50] hover:border-[#5683da] rounded-xl p-4 cursor-pointer transition-all space-y-3 shadow-md group"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-sm text-white group-hover:text-[#5683da] transition-colors">
                            {proj.projectName}
                          </h4>
                          {getStatusBadge(proj.status)}
                        </div>

                        <div className="text-xs text-[#ff8964] font-medium flex items-center space-x-1">
                          <Building className="w-3.5 h-3.5 text-[#95979e]" />
                          <span className="truncate">{proj.client.companyName}</span>
                        </div>

                        <p className="text-[11px] text-[#95979e] line-clamp-2">
                          {proj.description || 'No detailed specifications.'}
                        </p>

                        <div className="pt-2 border-t border-[#4a4b50]/30 flex items-center justify-between text-[10px] text-[#95979e] font-mono">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-emerald-400" />
                            <span>Target: {new Date(proj.deliveryDate).toLocaleDateString()}</span>
                          </span>
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
                  <th className="p-4">Project Name</th>
                  <th className="p-4">Assigned Client</th>
                  <th className="p-4">Target Delivery Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4a4b50]/40">
                {filteredProjects.map(proj => (
                  <tr key={proj.id} className="hover:bg-[#090a0c]/50 transition-colors">
                    <td className="p-4 font-bold text-white">{proj.projectName}</td>
                    <td className="p-4 text-[#ff8964] font-medium">
                      {proj.client.companyName}
                      <span className="block text-[10px] text-[#95979e] font-normal">{proj.client.user.name}</span>
                    </td>
                    <td className="p-4 font-mono text-emerald-400">
                      {new Date(proj.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">{getStatusBadge(proj.status)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedProject(proj)}
                        className="btn-pill-secondary py-1 px-3 text-[11px]"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setEditProject(proj)}
                        className="btn-pill-secondary p-1.5 text-[11px] text-[#5683da]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Project Details & Status Controls */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-lg w-full p-6 md:p-8 space-y-6 relative">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#5683da]/10 text-[#5683da] flex items-center justify-center font-bold text-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white">{selectedProject.projectName}</h3>
                  {getStatusBadge(selectedProject.status)}
                </div>
                <p className="text-xs text-[#ff8964] font-medium">{selectedProject.client.companyName}</p>
              </div>
            </div>

            <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/50 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#95979e]">Target Delivery:</span>
                <span className="text-emerald-400 font-mono font-bold">{new Date(selectedProject.deliveryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#95979e]">Contact Person:</span>
                <span className="text-white">{selectedProject.client.user.name} ({selectedProject.client.user.email})</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-[#95979e] uppercase font-mono block mb-1">Project Specifications</span>
              <div className="bg-[#090a0c] p-4 rounded-xl border border-[#4a4b50]/40 text-xs text-white leading-relaxed">
                {selectedProject.description || 'No detailed description.'}
              </div>
            </div>

            {/* Status Transition Toolbar */}
            <div>
              <label className="block text-xs font-mono text-[#95979e] uppercase mb-2">Advance Project Milestone</label>
              <div className="grid grid-cols-4 gap-2">
                {['PLANNING', 'DEVELOPMENT', 'TESTING', 'DELIVERED'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedProject.id, st)}
                    className={`tag-pill text-[10px] py-2 px-1 text-center transition-all ${
                      selectedProject.status === st
                        ? 'bg-[#5683da] text-white font-bold'
                        : 'bg-[#090a0c] border border-[#4a4b50] text-[#95979e] hover:border-[#5683da]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#4a4b50]/40 flex justify-between items-center">
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                className="text-xs text-red-400 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Project</span>
              </button>

              <button
                onClick={() => setSelectedProject(null)}
                className="btn-pill-secondary py-2 px-5 text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Project Details */}
      {editProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setEditProject(null)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Edit Project Specs</h3>

            <form onSubmit={handleUpdateProjectDetails} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={editProject.projectName}
                  onChange={(e) => setEditProject({ ...editProject, projectName: e.target.value })}
                  className="huly-input"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Target Delivery Date *</label>
                <input
                  type="date"
                  required
                  value={editProject.deliveryDate ? new Date(editProject.deliveryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditProject({ ...editProject, deliveryDate: e.target.value })}
                  className="huly-input font-mono"
                />
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Project Milestone Status</label>
                <select
                  value={editProject.status}
                  onChange={(e) => setEditProject({ ...editProject, status: e.target.value as any })}
                  className="huly-input"
                >
                  <option value="PLANNING">PLANNING</option>
                  <option value="DEVELOPMENT">DEVELOPMENT</option>
                  <option value="TESTING">TESTING</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  className="huly-input"
                />
              </div>

              <button
                type="submit"
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                Save Project Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Project */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="huly-card max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#95979e] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Create New Client Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#95979e] mb-1">Assign Client *</label>
                {clients.length === 0 ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    No active clients found. Please convert a lead or add a client first.
                  </div>
                ) : (
                  <select
                    value={newProject.clientId}
                    onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
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
                <label className="block text-[#95979e] mb-1">Project Name / Title *</label>
                <input
                  type="text"
                  required
                  value={newProject.projectName}
                  onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                  placeholder="Apex Restaurant Website & QR Menu"
                  className="huly-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#95979e] mb-1">Target Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={newProject.deliveryDate}
                    onChange={(e) => setNewProject({ ...newProject, deliveryDate: e.target.value })}
                    className="huly-input font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#95979e] mb-1">Initial Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    className="huly-input"
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="DEVELOPMENT">DEVELOPMENT</option>
                    <option value="TESTING">TESTING</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#95979e] mb-1">Project Scope Description</label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Details regarding pages, assets, or API integrations..."
                  className="huly-input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || clients.length === 0}
                className="btn-pill-primary w-full py-2.5 text-xs mt-2"
              >
                {submitting ? 'Creating Project...' : 'Launch Project Board'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
