import React, { useState } from 'react';
import { Star, CheckCircle, Trash2, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';

const TaskCard = ({ task, onMarkComplete, onDelete }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getHumanReadableDate = (dateStr) => {
    const now = new Date();
    // Reset hours to compare calendar days
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(dateStr);
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    const diffTime = dueDateOnly - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (isNaN(due.getTime())) return 'No due date';

    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return `Overdue by ${absDays} day${absDays > 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `in ${diffDays} days`;
    }
  };

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      await onMarkComplete(task._id);
    } catch (err) {
      alert('Failed to complete task');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task._id);
    } catch (err) {
      alert('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const isHighPriority = task.priorityScore >= 50 && task.status !== 'completed';
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div 
      className={`relative bg-slate-900/40 rounded-xl p-5 border transition flex flex-col justify-between h-full hover:shadow-lg ${
        isHighPriority 
          ? 'border-rose-500/50 shadow-rose-950/10 hover:border-rose-500 bg-gradient-to-br from-slate-900/60 to-rose-950/10' 
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* High Priority / Overdue Badge */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        {isHighPriority && (
          <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            High Priority
          </span>
        )}
        {task.status === 'completed' && (
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            Completed
          </span>
        )}
      </div>

      <div>
        {/* Title */}
        <h3 className={`text-lg font-bold pr-24 leading-snug ${
          task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'
        }`}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Info Rows */}
        <div className="mt-4 space-y-2 border-t border-slate-800/60 pt-3">
          {/* Importance (Stars) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-medium">Importance:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= task.importance
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-violet-400" />
            <span className={isOverdue ? 'text-rose-400 font-medium' : ''}>
              {getHumanReadableDate(task.dueDate)} 
              <span className="text-slate-500 ml-1">
                ({new Date(task.dueDate).toLocaleDateString()})
              </span>
            </span>
          </div>

          {/* Priority Score */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-medium">Priority Score:</span>
            <span className={`font-semibold text-sm ${
              task.status === 'completed' 
                ? 'text-slate-500' 
                : isHighPriority 
                  ? 'text-rose-400' 
                  : 'text-violet-400'
            }`}>
              {task.priorityScore}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-800/40 flex items-center justify-between gap-3">
        {task.status !== 'completed' ? (
          <button
            onClick={handleMarkComplete}
            disabled={isCompleting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
          >
            {isCompleting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            Complete
          </button>
        ) : (
          <div className="flex-1 text-xs text-emerald-400/70 font-medium flex items-center gap-1 py-2">
            <CheckCircle className="w-3.5 h-3.5 fill-emerald-500/10" />
            Task Done
          </div>
        )}

        {showConfirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-1.5 px-2.5 rounded-lg transition"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 px-2.5 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
