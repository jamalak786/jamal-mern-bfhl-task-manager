import React from 'react';
import TaskCard from './TaskCard';
import { Inbox, AlertCircle, Loader2 } from 'lucide-react';

const TaskList = ({ tasks, loading, error, onMarkComplete, onDelete }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
        <p className="text-sm font-medium">Fetching tasks from the server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3 my-6">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Failed to Load Tasks</h4>
          <p className="text-xs text-rose-400/80 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 text-slate-500">
        <Inbox className="w-12 h-12 mb-3 text-slate-600" />
        <p className="text-sm font-medium">No tasks found</p>
        <p className="text-xs text-slate-600 mt-1">Create a new task or adjust filters to see results.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onMarkComplete={onMarkComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;
