import React, { useState, useEffect, useCallback } from 'react';
import TaskForm from './components/TaskForm';
import Filters from './components/Filters';
import TaskList from './components/TaskList';
import { getTasks, createTask, updateTask, deleteTask } from './services/api';
import { CheckSquare, ListTodo, AlertCircle, Clock } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [status, setStatus] = useState('all');
  const [minImportance, setMinImportance] = useState(1);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (status !== 'all') {
        params.status = status;
      }
      if (minImportance > 1) {
        params.minImportance = minImportance;
      }
      const data = await getTasks(params);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [status, minImportance]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create Task
  const handleTaskCreated = async (taskData) => {
    await createTask(taskData);
    fetchTasks(); // Refetch to get updated list and priority scores
  };

  // Mark Task as Complete
  const handleMarkComplete = async (id) => {
    await updateTask(id, { status: 'completed' });
    fetchTasks(); // Refetch to recalculate scores (completed score = 0) and sort
  };

  // Delete Task
  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks((prevTasks) => prevTasks.filter((t) => t._id !== id));
  };

  // Calculate local stats for header cards
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const highPriorityCount = tasks.filter(t => t.priorityScore >= 50 && t.status !== 'completed').length;
  const overdueCount = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-violet-900/30">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">TaskFlow</h1>
              <p className="text-xs text-slate-400">Smart Priority-Scored Task Manager</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">{totalCount}</span>
              <span className="text-xs text-slate-400">Filtered Tasks</span>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">{pendingCount}</span>
              <span className="text-xs text-slate-400">Pending Tasks</span>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">{highPriorityCount}</span>
              <span className="text-xs text-slate-400">High Priority (≥50)</span>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">{overdueCount}</span>
              <span className="text-xs text-slate-400">Overdue Tasks</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Filters */}
          <div className="space-y-6 lg:col-span-1">
            <TaskForm onTaskCreated={handleTaskCreated} />
            <Filters 
              status={status} 
              setStatus={setStatus} 
              minImportance={minImportance} 
              setMinImportance={setMinImportance} 
            />
          </div>

          {/* Right Column: Task List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Tasks List</h2>
              <span className="text-xs text-slate-400">Sorted by Priority Score DESC</span>
            </div>
            <TaskList 
              tasks={tasks}
              loading={loading}
              error={error}
              onMarkComplete={handleMarkComplete}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
