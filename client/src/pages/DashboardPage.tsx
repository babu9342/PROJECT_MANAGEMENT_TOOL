import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { taskService, projectService } from '../services/services';
import { formatDistanceToNow, format } from 'date-fns';
import CreateProjectModal from '../components/CreateProjectModal';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  recentTasks: any[];
}

const priorityColors: Record<string, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, setProjects, addProject } = useProjectStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, projectsRes] = await Promise.all([
          taskService.getStats(),
          projectService.getAll(),
        ]);
        setStats(statsRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAvatar = (name: string, avatar: string) => {
    if (avatar) return `http://localhost:5000${avatar}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`;
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      color: 'from-primary-600/20 to-primary-600/5',
      iconColor: 'text-primary-400',
      iconBg: 'bg-primary-500/20',
    },
    {
      title: 'Completed Tasks',
      value: stats?.completedTasks ?? 0,
      icon: CheckCircle2,
      color: 'from-emerald-600/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20',
    },
    {
      title: 'In Progress',
      value: stats?.inProgressTasks ?? 0,
      icon: TrendingUp,
      color: 'from-accent-600/20 to-accent-600/5',
      iconColor: 'text-accent-400',
      iconBg: 'bg-accent-500/20',
    },
    {
      title: 'Overdue Tasks',
      value: stats?.overdueTasks ?? 0,
      icon: AlertTriangle,
      color: 'from-red-600/20 to-red-600/5',
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/20',
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded-xl w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-800 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-dark-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark-50">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-dark-400 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} · Here's your workspace overview
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ title, value, icon: Icon, color, iconColor, iconBg }) => (
            <div key={title} className={`stat-card bg-gradient-to-br ${color} border border-dark-700/50`}>
              <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={iconColor} size={22} />
              </div>
              <div>
                <p className="text-3xl font-bold text-dark-50">{value}</p>
                <p className="text-sm text-dark-400 mt-0.5">{title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-dark-100 text-lg">Recent Projects</h2>
              <Link to="/projects" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="card p-8 text-center">
                  <FolderKanban size={40} className="text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400 mb-4">No projects yet. Create your first one!</p>
                  <button onClick={() => setShowCreate(true)} className="btn-primary">
                    <Plus size={16} className="inline mr-1" />
                    Create Project
                  </button>
                </div>
              ) : (
                projects.slice(0, 4).map((project) => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="card-hover p-4 flex items-center gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 shadow-lg"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-dark-100 truncate">{project.name}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0 ${
                            project.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : project.status === 'completed'
                              ? 'bg-primary-500/15 text-primary-400'
                              : 'bg-dark-700 text-dark-400'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="progress-bar flex-1">
                          <div
                            className="progress-fill"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-dark-500 flex-shrink-0">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-dark-500">
                          {project.totalTasks || 0} tasks
                        </span>
                        <div className="flex -space-x-1.5">
                          {project.members.slice(0, 3).map((m) => (
                            <img
                              key={m.user._id}
                              src={getAvatar(m.user.name, m.user.avatar)}
                              alt={m.user.name}
                              title={m.user.name}
                              className="w-5 h-5 rounded-full ring-2 ring-dark-900"
                            />
                          ))}
                          {project.members.length > 3 && (
                            <div className="w-5 h-5 rounded-full bg-dark-700 ring-2 ring-dark-900 flex items-center justify-center text-[9px] text-dark-400">
                              +{project.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-dark-100 text-lg mb-4">Recent Activity</h2>
            <div className="card p-4 space-y-3 max-h-[420px] overflow-y-auto">
              {!stats?.recentTasks?.length ? (
                <div className="text-center py-8 text-dark-500">
                  <Clock size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                stats.recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-800/50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        priorityColors[task.priority] || 'bg-dark-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-200 font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-dark-500 truncate">
                          {typeof task.project === 'object' ? task.project.name : ''}
                        </span>
                        {task.assignedTo && (
                          <span className="text-xs text-dark-500 flex items-center gap-1">
                            <User size={10} />
                            {task.assignedTo.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-dark-600 mt-0.5">
                        {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    {task.assignedTo && (
                      <img
                        src={getAvatar(task.assignedTo.name, task.assignedTo.avatar)}
                        alt={task.assignedTo.name}
                        className="w-7 h-7 rounded-full flex-shrink-0"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={(p) => addProject(p)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
