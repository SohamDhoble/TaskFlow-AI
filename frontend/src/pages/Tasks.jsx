import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/TaskCard';
import api from '../api';
import {
  Plus, X, Loader2, ArrowLeft, Sparkles, Clock,
  Calendar, CheckSquare, Pencil,
} from 'lucide-react';

const columns = [
  { id: 'todo', title: 'Todo', color: 'from-primary to-primary-600', badge: 'bg-primary/20 text-primary' },
  { id: 'in_progress', title: 'In Progress', color: 'from-amber-500 to-amber-600', badge: 'bg-amber-500/20 text-amber-400' },
  { id: 'done', title: 'Done', color: 'from-emerald-500 to-emerald-600', badge: 'bg-emerald-500/20 text-emerald-400' },
];

const statusOptions = [
  { value: 'todo', label: 'Todo', color: 'border-primary bg-primary/10 text-primary' },
  { value: 'in_progress', label: 'In Progress', color: 'border-amber-500 bg-amber-500/10 text-amber-400' },
  { value: 'done', label: 'Done', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
];

const Tasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Edit mode state: null = creating, task object = editing */
  const [editingTask, setEditingTask] = useState(null);

  /* AI / ML states */
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlPrediction, setMlPrediction] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', due_date: '', status: 'todo',
  });

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, projectRes] = await Promise.all([
        api.get(`/tasks/${projectId}`),
        api.get('/projects').then((r) => r.data.find((p) => p.id === parseInt(projectId))),
      ]);
      setTasks(tasksRes.data);
      setProject(projectRes);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Drag and drop */
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update task');
      fetchData();
    }
  };

  /* AI Priority Suggestion */
  const handleAiSuggest = async () => {
    if (!form.title.trim()) { toast.error('Enter a task title first'); return; }
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await api.post('/ai/suggest-priority', {
        title: form.title,
        description: form.description,
      });
      setAiSuggestion(res.data);
    } catch {
      toast.info('AI Suggestions work in the local Ollama demo only.')
    } finally {
      setAiLoading(false);
    }
  };

  /* ML Prediction */
  const handleMlPredict = async () => {
    if (!form.title.trim()) { toast.error('Enter a task title first'); return; }
    setMlLoading(true);
    setMlPrediction(null);
    try {
      const res = await api.post('/ml/predict-time', {
        title: form.title,
        description: form.description,
        priority: form.priority,
      });
      setMlPrediction(res.data);
    } catch {
      toast.error('Prediction failed');
    } finally {
      setMlLoading(false);
    }
  };

  /* Save task (create or update) */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Task title is required'); return; }
    setSaving(true);
    try {
      if (editingTask) {
        // ── UPDATE ──
        const payload = {
          title: form.title,
          description: form.description || null,
          priority: form.priority,
          status: form.status,
          due_date: form.due_date || null,
        };
        await api.put(`/tasks/${editingTask.id}`, payload);
        toast.success('Task updated!');
      } else {
        // ── CREATE ──
        const payload = {
          ...form,
          project_id: parseInt(projectId),
          due_date: form.due_date || null,
          ai_priority: aiSuggestion?.priority || null,
          predicted_time: mlPrediction?.predicted_time || null,
        };
        await api.post('/tasks', payload);
        toast.success('Task created!');
      }
      closeModal();
      fetchData();
    } catch {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const openNewTaskModal = (status = 'todo') => {
    setEditingTask(null);
    setForm({ title: '', description: '', priority: 'medium', due_date: '', status });
    setAiSuggestion(null);
    setMlPrediction(null);
    setModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status || 'todo',
    });
    setAiSuggestion(null);
    setMlPrediction(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
    setForm({ title: '', description: '', priority: 'medium', due_date: '', status: 'todo' });
    setAiSuggestion(null);
    setMlPrediction(null);
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success('Task deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const getColumnTasks = (colId) => tasks.filter((t) => t.status === colId);

  const isEditing = !!editingTask;

  return (
    <div className="lg:mt-0 mt-16 space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-xl hover:bg-dark-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              {project?.name || 'Tasks'}
            </h1>
            <p className="text-text-secondary mt-0.5 text-sm">
              {tasks.length} tasks · Kanban Board
            </p>
          </div>
        </div>
        <button
          id="new-task-btn"
          onClick={() => openNewTaskModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 btn-press"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-4">
              <div className="w-1/2 h-6 rounded skeleton" />
              {[...Array(3)].map((__, j) => (
                <div key={j} className="p-4 rounded-xl skeleton h-32" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
            {columns.map((col) => {
              const colTasks = getColumnTasks(col.id);
              return (
                <div key={col.id} className="bg-dark-card/50 border border-dark-border rounded-2xl flex flex-col kanban-column">
                  {/* Column header */}
                  <div className="p-4 border-b border-dark-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${col.color}`} />
                        <h3 className="text-sm font-bold text-text-primary">{col.title}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${col.badge}`}>
                          {colTasks.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Task list */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 space-y-3 overflow-y-auto transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-primary/5' : ''
                          }`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                className={`${snapshot.isDragging ? 'shadow-2xl shadow-primary/20 rotate-2' : ''} transition-transform`}
                              >
                                <TaskCard
                                  ref={provided.innerRef}
                                  task={task}
                                  provided={provided}
                                  onEdit={openEditTaskModal}
                                  onDelete={handleDeleteTask}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckSquare className="w-8 h-8 text-text-secondary/20 mb-2" />
                            <p className="text-xs text-text-secondary/50">No tasks here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>

                  {/* Add task button */}
                  <div className="p-3 border-t border-dark-border">
                    <button
                      onClick={() => openNewTaskModal(col.id)}
                      className="w-full py-2 rounded-xl border border-dashed border-dark-border text-sm font-medium text-text-secondary hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Create / Edit Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className={`h-1 bg-gradient-to-r ${isEditing ? 'from-amber-500 to-orange-500' : 'from-primary to-secondary'}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {isEditing && <Pencil className="w-5 h-5 text-amber-400" />}
                  <h2 className="text-xl font-bold text-text-primary">
                    {isEditing ? 'Edit Task' : 'New Task'}
                  </h2>
                </div>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-dark-hover transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Title</label>
                  <input
                    id="task-title-input"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-text-primary placeholder-text-secondary/50 text-sm focus:border-primary transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Description</label>
                  <textarea
                    id="task-description-input"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Add more details..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-text-primary placeholder-text-secondary/50 text-sm focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* Due date */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                    <input
                      id="task-due-date-input"
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-text-primary text-sm focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Priority selector */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Priority</label>
                  <div className="flex gap-3">
                    {['high', 'medium', 'low'].map((p) => {
                      const colors = {
                        high: 'border-red-500 bg-red-500/10 text-red-400',
                        medium: 'border-amber-500 bg-amber-500/10 text-amber-400',
                        low: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
                      };
                      const active = form.priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, priority: p })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize border-2 transition-all duration-200 ${active ? colors[p] : 'border-dark-border text-text-secondary hover:border-dark-hover'
                            }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status selector (shown in edit mode, or always for clarity) */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Status</label>
                  <div className="flex gap-3">
                    {statusOptions.map((s) => {
                      const active = form.status === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setForm({ ...form, status: s.value })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${active ? s.color : 'border-dark-border text-text-secondary hover:border-dark-hover'
                            }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Priority Suggestion */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-secondary/30 bg-secondary/5 text-secondary text-sm font-semibold hover:bg-secondary/10 transition-all disabled:opacity-50 btn-press"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    ✨ AI Priority
                  </button>
                  <button
                    type="button"
                    onClick={handleMlPredict}
                    disabled={mlLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent/30 bg-accent/5 text-accent text-sm font-semibold hover:bg-accent/10 transition-all disabled:opacity-50 btn-press"
                  >
                    {mlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                    ⏱ Predict Time
                  </button>
                </div>

                {/* AI Suggestion Result */}
                {aiSuggestion && (
                  <div className="p-4 rounded-xl border border-secondary/30 bg-secondary/5 animate-slide-up">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-bold text-secondary">AI Suggestion</span>
                    </div>
                    <p className="text-sm text-text-primary mb-1">
                      Priority: <span className="font-bold capitalize">{aiSuggestion.priority}</span>
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">{aiSuggestion.reason}</p>
                  </div>
                )}

                {/* ML Prediction Result */}
                {mlPrediction && (
                  <div className="p-4 rounded-xl border border-accent/30 bg-accent/5 animate-slide-up">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-accent">Completion Prediction</span>
                    </div>
                    <p className="text-sm text-text-primary">
                      Estimated: <span className="font-bold">{mlPrediction.predicted_time}</span>
                    </p>
                  </div>
                )}

                {/* Save / Cancel */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60 btn-press ${isEditing
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-amber-500/25'
                      : 'bg-gradient-to-r from-primary to-secondary hover:shadow-primary/25'
                      }`}
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? 'Save Changes' : 'Create Task'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
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

export default Tasks;
