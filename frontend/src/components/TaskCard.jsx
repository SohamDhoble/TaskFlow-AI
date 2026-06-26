import React from 'react';
import { Clock, Sparkles, GripVertical, AlertCircle, Trash2 } from 'lucide-react';

const priorityConfig = {
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
};

const TaskCard = React.forwardRef(({ task, provided, onEdit, onDelete }, ref) => {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      ref={ref}
      {...(provided?.draggableProps || {})}
      onClick={() => onEdit?.(task)}
      className="bg-dark-card border border-dark-border rounded-xl p-4 card-hover group relative cursor-pointer"
    >
      {/* Drag handle */}
      <div
        {...(provided?.dragHandleProps || {})}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-text-secondary" />
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-text-primary mb-1.5 pr-6 line-clamp-1">
        {task.title}
      </h4>

      {/* Description */}
      <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">
        {task.description || 'No description'}
      </p>

      {/* Priority badge */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide ${priority.bg} ${priority.text} border ${priority.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {task.priority}
        </span>

        {task.ai_priority && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-secondary/10 text-secondary border border-secondary/30">
            <Sparkles className="w-3 h-3" /> AI: {task.ai_priority}
          </span>
        )}
      </div>

      {/* Predicted time */}
      {task.predicted_time && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-accent/10 text-accent border border-accent/30">
            <Clock className="w-3 h-3" /> ~{task.predicted_time}
          </span>
        </div>
      )}

      {/* Due date + delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">
            {task.due_date
              ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'No due date'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done' && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-red-400">
              <AlertCircle className="w-3 h-3" /> Overdue
            </span>
          )}

          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-all"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;
