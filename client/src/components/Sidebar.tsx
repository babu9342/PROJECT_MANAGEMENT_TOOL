import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Bell,
  Search,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Zap,
  X,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useNotificationStore } from '../store/notificationStore';
import { notificationService } from '../services/services';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  onNewProject?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewProject }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuthStore();
  const { projects } = useProjectStore();
  const { notifications, unreadCount, setNotifications, markRead, markAllRead } =
    useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getAll();
        setNotifications(res.data.notifications, res.data.unreadCount);
      } catch {}
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      markRead(id);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      markAllRead();
    } catch {}
  };

  const getAvatar = (name: string, avatar: string) => {
    if (avatar) return `http://localhost:5000${avatar}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`;
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 bg-dark-900 border-r border-dark-700/50 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } flex-shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700/50">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">FlowBoard</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center mx-auto">
            <Zap size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost p-1.5 rounded-lg ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`sidebar-item ${isActive(path) ? 'active' : ''}`}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {/* Projects list */}
        {!collapsed && projects.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider px-3 mb-2">
              Recent Projects
            </p>
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className={`sidebar-item ${
                  location.pathname === `/projects/${project._id}` ? 'active' : ''
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate text-sm">{project.name}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-dark-700/50 space-y-2">
        {/* New Project Button */}
        {!collapsed && (
          <button
            onClick={onNewProject}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-400 hover:bg-primary-500/10 border border-primary-500/20 transition-all"
          >
            <Plus size={16} />
            New Project
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative sidebar-item w-full"
          >
            <Bell size={18} />
            {!collapsed && <span>Notifications</span>}
            {unreadCount > 0 && (
              <span className="absolute top-1 left-4 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute bottom-full left-0 w-80 mb-2 bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl z-50 animate-fade-in">
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <h3 className="font-semibold text-dark-100">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-dark-400 hover:text-dark-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-dark-400 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.read && handleMarkRead(n._id)}
                      className={`p-3 hover:bg-dark-700/50 cursor-pointer transition-colors border-b border-dark-700/30 last:border-0 ${
                        !n.read ? 'bg-primary-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {n.sender ? (
                          <img
                            src={getAvatar(n.sender.name, n.sender.avatar)}
                            alt={n.sender.name}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                            <Bell size={14} className="text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-dark-200 leading-snug">{n.message}</p>
                          <p className="text-xs text-dark-500 mt-0.5">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-dark-800 transition-colors"
          >
            <img
              src={getAvatar(user?.name || 'User', user?.avatar || '')}
              alt={user?.name}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            {!collapsed && (
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-200 truncate">{user?.name}</p>
                <p className="text-xs text-dark-500 truncate">{user?.email}</p>
              </div>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 w-48 mb-2 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl z-50 animate-fade-in overflow-hidden">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-3 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={15} />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-dark-700 transition-colors w-full text-left"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
