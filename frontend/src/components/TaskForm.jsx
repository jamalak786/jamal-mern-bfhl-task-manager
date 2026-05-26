import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';

const TaskForm = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importance, setImportance] = useState(3);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!title.trim()) {
      return 'Title is required';
    }
    if (title.length < 3 || title.length > 100) {
      return 'Title must be between 3 and 100 characters';
    }
    if (description.length > 500) {
      return 'Description cannot exceed 500 characters';
    }
    if (!dueDate) {
      return 'Due date is required';
    }
    const selectedDate = new Date(dueDate);
    if (selectedDate <= new Date()) {
      return 'Due date must be in the future';
    }
    const impVal = Number(importance);
    if (isNaN(impVal) || impVal < 1 || impVal > 5) {
      return 'Importance must be between 1 and 5';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onTaskCreated({
        title,
        description,
        importance: Number(importance),
        dueDate
      });
      // Reset form
      setTitle('');
      setDescription('');
      setImportance(3);
      setDueDate('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <PlusCircle className="text-violet-500 w-5 h-5" />
        Create New Task
      </h2>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="title">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none transition"
            placeholder="E.g., Complete math assignment"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none transition resize-none h-20"
            placeholder="E.g., Focus on chapter 3 integrations..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="importance">
              Importance (1 - 5) <span className="text-rose-500">*</span>
            </label>
            <select
              id="importance"
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-white focus:outline-none transition"
            >
              <option value="1">1 - Low</option>
              <option value="2">2 - Medium-Low</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="dueDate">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-white focus:outline-none transition"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Task'
          )}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
