import React, { useState, useEffect, useCallback } from 'react';
import TaskForm from './components/TaskForm';
import Filters from './components/Filters';
import TaskList from './components/TaskList';
import { getTasks, createTask, updateTask, deleteTask, getTaskStats } from './services/api';
import { CheckSquare, ListTodo, AlertCircle, Clock, Percent, Star } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Aggregated Stats State
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    averageImportance: 0,
    overdueTasks: 0,
    tasksByImportance: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  });
  const [loadingStats, setLoadingStats] = useState(true);

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

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await getTaskStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // Create Task
  const handleTaskCreated = async (taskData) => {
    await createTask(taskData);
    fetchTasks(); // Refetch to get updated list and priority scores
    fetchStats();
  };

  // Mark Task as Complete
  const handleMarkComplete = async (id) => {
    await updateTask(id, { status: 'completed' });
    fetchTasks(); // Refetch to recalculate scores (completed score = 0) and sort
    fetchStats();
  };

  // Delete Task
  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks((prevTasks) => prevTasks.filter((t) => t._id !== id));
    fetchStats();
  };

  // Calculate local high priority stats for filtered tasks
  const highPriorityCount = tasks.filter(t => t.priorityScore >= 50 && t.status !== 'completed').length;

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
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Main Aggregated Stats Cards */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">
                  {loadingStats ? '...' : stats.totalTasks}
                </span>
                <span className="text-xs text-slate-400">Total Tasks (DB)</span>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">
                  {loadingStats ? '...' : stats.pendingTasks}
                </span>
                <span className="text-xs text-slate-400">Pending Tasks (DB)</span>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">
                  {loadingStats ? '...' : stats.overdueTasks}
                </span>
                <span className="text-xs text-slate-400">Overdue Tasks (DB)</span>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">
                  {loadingStats ? '...' : `${stats.averageImportance}/5`}
                </span>
                <span className="text-xs text-slate-400">Avg. Importance</span>
              </div>
            </div>
          </div>

          {/* Aggregated Tasks by Importance Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tasks By Importance</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((level) => {
                  const count = stats.tasksByImportance[level.toString()] || 0;
                  const total = stats.totalTasks || 1;
                  const percentage = stats.totalTasks > 0 ? (count / total) * 100 : 0;
                  const colors = {
                    5: 'bg-rose-500',
                    4: 'bg-orange-500',
                    3: 'bg-amber-500',
                    2: 'bg-yellow-500',
                    1: 'bg-blue-500'
                  };
                  return (
                    <div key={level} className="flex items-center gap-2 text-xs">
                      <span className="w-12 text-slate-400 font-medium">Lvl {level} ({count})</span>
                      <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full ${colors[level] || 'bg-violet-500'} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
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
