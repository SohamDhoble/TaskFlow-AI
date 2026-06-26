import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ProjectCard from '../components/ProjectCard';
import api from '../api';
import {
  Plus, Search, Filter, X, Loader2, FolderKanban,
  Calendar,
} from 'lucide-react';

const statusOptions = ['all', 'active', 'planning', 'completed', 'on_hold'];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deadline: '', status: 'active' });
  const toast = useToast();
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setForm({
        name: project.name,
        description: project.description || '',
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
        status: project.status || 'active',
      });
    } else {
      setEditingProject(null);
      setForm({ name: '', description: '', deadline: '', status: 'active' });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, deadline: form.deadline || null };
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, payload);
        toast.success('Project updated!');
      } else {
        await api.post('/projects', payload);
        toast.success('Project created!');
      }
      setModalOpen(false);
      fetchProjects();
    } catch {
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete "${project.name}"? This will also delete all its tasks.`)) return;
    try {
      await api.delete(`/projects/${project.id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleClick = (project) => {
    navigate(`/projects/${project.id}/tasks`);
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="lg:mt-0 mt-16 space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Projects</h1>
          <p className="text-text-secondary mt-1">Manage and track all your projects</p>
        </div>
        <button
          id="new-project-btn"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 btn-press"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
          <input
            id="project-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-text-primary placeholder-text-secondary/50 text-sm focus:border-primary transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <select
            id="project-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl bg-dark-card border border-dark-border text-text-primary text-sm focus:border-primary transition-all appearance-none cursor-pointer"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              <div className="h-1 skeleton" />
              <div className="p-6 space-y-4">
                <div className="w-2/3 h-6 rounded skeleton" />
                <div className="w-full h-4 rounded skeleton" />
                <div className="w-1/2 h-4 rounded skeleton" />
                <div className="w-full h-2 rounded-full skeleton mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <div key={project.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <ProjectCard
                project={project}
                onEdit={openModal}
                onDelete={handleDelete}
                onClick={handleClick}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center mb-4">
            <FolderKanban className="w-10 h-10 text-text-secondary/30" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-1">No projects found</h3>
          <p className="text-sm text-text-secondary mb-4">
            {search || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Create your first project to get started'}
          </p>
          {!search && filterStatus === 'all' && (
            <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all btn-press">
              <Plus className="w-4 h-4" /> Create Project
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text-primary">
                  {editingProject ? 'Edit Project' : 'New Project'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-dark-hover transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Project Name</label>
                  <input
                    id="project-name-input"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter project name"
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-text-primary placeholder-text-secondary/50 text-sm focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Description</label>
                  <textarea
                    id="project-description-input"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your project..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-text-primary placeholder-text-secondary/50 text-sm focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Deadline</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                      <input
                        id="project-deadline-input"
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-text-primary text-sm focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Status</label>
                    <select
                      id="project-status-input"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-text-primary text-sm focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="planning">Planning</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-60 btn-press"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-3 rounded-xl border border-dark-border text-text-secondary text-sm font-semibold hover:bg-dark-hover transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
