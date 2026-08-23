import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  FolderKanban,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { projectService } from '../services/services';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import CreateProjectModal from '../components/CreateProjectModal';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  completed: 'bg-primary-500/15 text-primary-400 border-primary-500/20',
  archived: 'bg-dark-700 text-dark-400 border-dark-600',
  'on-hold': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

const ProjectsPage: React.FC = () => {
  const { projects, setProjects, addProject, removeProject } = useProjectStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll();
      setProjects(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this project? All tasks will be removed.')) return;
    try {
      await projectService.delete(id);
      removeProject(id);
      toast.success('Project deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
    setOpenMenu(null);
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const getAvatar = (name: string, avatar: string) => {
    if (avatar) return `http://localhost:5000${avatar}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark-50">Projects</h1>
            <p className="text-dark-400 mt-1">{projects.length} projects in your workspace</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search projects..."
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'completed', 'on-hold', 'archived'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Projects grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 bg-dark-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FolderKanban size={64} className="text-dark-700 mx-auto mb-4" />
            <h3 className="text-dark-300 font-semibold text-xl mb-2">
              {search ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-dark-500 mb-6">
              {search ? 'Try a different search term' : 'Create your first project to get started'}
            </p>
            {!search && (
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus size={16} className="inline mr-1" />
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="card-hover p-6 cursor-pointer relative group"
              >
                {/* Menu button */}
                {project.owner._id === user?._id && (
                  <div
                    className="absolute top-4 right-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === project._id ? null : project._id)
                      }
                      className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === project._id && (
                      <div className="absolute right-0 top-8 w-36 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-10 animate-fade-in overflow-hidden">
                        <button
                          onClick={() => navigate(`/projects/${project._id}`)}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
                        >
                          <Edit size={14} />
                          Open Board
                        </button>
                        <button
                          onClick={(e) => handleDelete(project._id, e)}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-dark-700 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 shadow-lg"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-dark-100 truncate group-hover:text-white transition-colors">
                      {project.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-dark-400 mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-dark-500 mb-1.5">
                    <span>{project.completedTasks || 0}/{project.totalTasks || 0} tasks</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((m) => (
                      <img
                        key={m.user._id}
                        src={getAvatar(m.user.name, m.user.avatar)}
                        alt={m.user.name}
                        title={m.user.name}
                        className="w-7 h-7 rounded-full ring-2 ring-dark-900"
                      />
                    ))}
                    {project.members.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-dark-700 ring-2 ring-dark-900 flex items-center justify-center text-[10px] text-dark-300 font-medium">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-dark-500 flex items-center gap-1">
                    <Clock size={11} />
                    {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default ProjectsPage;
