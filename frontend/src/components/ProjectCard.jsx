import React from 'react';
import { Calendar, MoreVertical, Trash2, Edit3 } from 'lucide-react';

const statusColors = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-emerald-600' },
  planning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-amber-600' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-blue-600' },
  on_hold: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', gradient: 'from-red-500 to-red-600' },
};

const ProjectCard = ({ project, onEdit, onDelete, onClick }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const status = statusColors[project.status] || statusColors.active;
  const taskCount = project.task_count || 0;
  const completedCount = project.completed_count || 0;
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <div
      className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden card-hover cursor-pointer relative group"
      onClick={() => onClick?.(project)}
    >
      {/* Gradient top border */}
      <div className={`h-1 bg-gradient-to-r ${status.gradient}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-text-primary leading-tight pr-4 line-clamp-1">
            {project.name}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors opacity-0 group-hover:opacity-100"
              id={`project-menu-${project.id}`}
            >
              <MoreVertical className="w-4 h-4 text-text-secondary" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-36 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-10 py-1 animate-scale-in">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(project); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-dark-hover transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(project); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed">
          {project.description || 'No description provided'}
        </p>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
          <Calendar className="w-4 h-4" />
          <span>{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}</span>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${status.bg} ${status.text} border ${status.border}`}>
            {project.status?.replace('_', ' ') || 'Active'}
          </span>
          <span className="text-xs text-text-secondary">
            {completedCount}/{taskCount} tasks
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-text-secondary mt-2 text-right font-medium">{progress}% complete</p>

        {/* Avatar stack */}
        <div className="flex items-center mt-4 -space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 border-2 border-dark-card flex items-center justify-center text-[10px] font-bold text-white"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full bg-dark-hover border-2 border-dark-card flex items-center justify-center text-[10px] font-medium text-text-secondary">
            +2
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
