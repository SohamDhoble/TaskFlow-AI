import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TasksByStatusChart, TasksByPriorityChart } from '../components/Chart';
import api from '../api';
import {
  FolderKanban, CheckSquare, CheckCircle2, Clock,
  Plus, TrendingUp, Activity, Loader2,
} from 'lucide-react';

/* Count-up hook */
const useCountUp = (target, duration = 1000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const StatCard = ({ icon: Icon, label, value, gradient, delay }) => {
  const animatedValue = useCountUp(value);
  return (
    <div className={`bg-dark-card border border-dark-border rounded-2xl p-6 card-hover animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
          <TrendingUp className="w-3 h-3" />
          +12%
        </div>
      </div>
      <p className="text-3xl font-extrabold text-text-primary tracking-tight">{animatedValue}</p>
      <p className="text-sm text-text-secondary mt-1 font-medium">{label}</p>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl skeleton" />
      <div className="w-16 h-6 rounded-lg skeleton" />
    </div>
    <div className="w-20 h-8 rounded skeleton mb-2" />
    <div className="w-28 h-4 rounded skeleton" />
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.allSettled([
          api.get('/projects'),
          api.get('/tasks/all'),
        ]);

        const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
        const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.data : [];

        const todo = tasks.filter((t) => t.status === 'todo').length;
        const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
        const done = tasks.filter((t) => t.status === 'done').length;
        const high = tasks.filter((t) => t.priority === 'high').length;
        const medium = tasks.filter((t) => t.priority === 'medium').length;
        const low = tasks.filter((t) => t.priority === 'low').length;

        setStats({
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks: done,
          pendingTasks: todo + inProgress,
          statusData: { todo, in_progress: inProgress, done },
          priorityData: { high, medium, low },
          recentTasks: tasks.slice(-5).reverse(),
        });
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  const statCards = [
    { icon: FolderKanban, label: 'Total Projects', value: stats?.totalProjects || 0, gradient: 'from-blue-500 to-blue-600' },
    { icon: CheckSquare, label: 'Total Tasks', value: stats?.totalTasks || 0, gradient: 'from-purple-500 to-purple-600' },
    { icon: CheckCircle2, label: 'Completed Tasks', value: stats?.completedTasks || 0, gradient: 'from-emerald-500 to-emerald-600' },
    { icon: Clock, label: 'Pending Tasks', value: stats?.pendingTasks || 0, gradient: 'from-amber-500 to-amber-600' },
  ];

  const statusColor = {
    todo: 'bg-primary',
    in_progress: 'bg-amber-500',
    done: 'bg-emerald-500',
  };

  return (
    <div className="lg:mt-0 mt-16 space-y-8 page-enter">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-text-secondary mt-1">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 btn-press"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, i) => (
              <StatCard key={card.label} {...card} delay={i * 100} />
            ))
        }
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts — 2 cols */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <>
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 h-[360px] skeleton" />
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 h-[360px] skeleton" />
            </>
          ) : (
            <>
              <TasksByStatusChart data={stats?.statusData} />
              <TasksByPriorityChart data={stats?.priorityData} />
            </>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Recent Activity</h3>
            <Activity className="w-5 h-5 text-text-secondary" />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full skeleton mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 rounded skeleton" />
                    <div className="w-1/2 h-3 rounded skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentTasks?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTasks.map((task, i) => (
                <div key={task.id} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${statusColor[task.status] || 'bg-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{task.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {task.status?.replace('_', ' ')} · {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                    task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-10 h-10 text-text-secondary/30 mb-3" />
              <p className="text-sm text-text-secondary">No recent activity</p>
              <p className="text-xs text-text-secondary/60 mt-1">Create a project to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
