import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import {
  Plus,
  Search,
  ArrowLeft,
  UserPlus,
  X,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import type { Task } from '../store/taskStore';
import { projectService, taskService } from '../services/services';
import { useAuthStore } from '../store/authStore';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import CreateTaskModal from '../components/CreateTaskModal';
import toast from 'react-hot-toast';
import { joinProjectRoom, leaveProjectRoom, getSocket, emitTaskMoved } from '../services/socket';
import { joinUserRoom } from '../services/socket';
import { useNotificationStore } from '../store/notificationStore';

const COLUMNS: { id: Task['status']; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'bg-dark-500' },
  { id: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { id: 'inprogress', label: 'In Progress', color: 'bg-primary-500' },
  { id: 'review', label: 'Review', color: 'bg-amber-500' },
  { id: 'done', label: 'Done', color: 'bg-emerald-500' },
];

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeProject, setActiveProject } = useProjectStore();
  const { tasksByStatus, setTasks, addTask, updateTask, removeTask } = useTaskStore();
  const { addNotification } = useNotificationStore();

  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createStatus, setCreateStatus] = useState<Task['status']>('todo');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
      joinProjectRoom(id);

      const socket = getSocket();

      // Socket listeners
      socket.on('taskMoved', (data: any) => {
        if (data.projectId === id) {
          updateTask(data.task);
        }
      });
      socket.on('taskCreated', (data: any) => {
        if (data.projectId === id) {
          addTask(data.task);
        }
      });
      socket.on('taskUpdated', (data: any) => {
        if (data.projectId === id) {
          updateTask(data.task);
        }
      });
      socket.on('taskDeleted', (data: any) => {
        if (data.projectId === id) {
          removeTask(data.taskId);
        }
      });
      socket.on('notification', (notification: any) => {
        addNotification(notification);
        toast(notification.message, { icon: '🔔' });
      });

      return () => {
        leaveProjectRoom(id);
        socket.off('taskMoved');
        socket.off('taskCreated');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
        socket.off('notification');
      };
    }
  }, [id]);

  // Join user room for notifications
  useEffect(() => {
    if (user) joinUserRoom(user._id);
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getOne(id!),
        taskService.getByProject(id!),
      ]);
      setActiveProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch {
      toast.error('Failed to load board');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId as Task['status'];
    const sourceCol = [...(tasksByStatus[source.droppableId as Task['status']] || [])];
    const destCol = source.droppableId === destination.droppableId
      ? sourceCol
      : [...(tasksByStatus[newStatus] || [])];

    // Find the task
    const taskIndex = sourceCol.findIndex((t) => t._id === draggableId);
    const [movedTask] = sourceCol.splice(taskIndex, 1);

    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, movedTask);
    } else {
      destCol.splice(destination.index, 0, movedTask);
    }

    // Build reorder payload
    const updates = destCol.map((t, i) => ({
      id: t._id,
      status: newStatus,
      order: i,
    }));
    if (source.droppableId !== destination.droppableId) {
      sourceCol.forEach((t, i) => updates.push({ id: t._id, status: source.droppableId as Task['status'], order: i }));
    }

    // Optimistic update
    updateTask({ ...movedTask, status: newStatus, order: destination.index });

    try {
      await taskService.reorder(updates);
      emitTaskMoved({ projectId: id, task: { ...movedTask, status: newStatus } });
    } catch {
      toast.error('Failed to save reorder');
    }
  };

  const handleTaskCreated = (task: Task) => {
    addTask(task);
  };

  const handleTaskUpdated = (task: Task) => {
    updateTask(task);
    setSelectedTask(task);
  };

  const handleTaskDeleted = (taskId: string) => {
    removeTask(taskId);
    setSelectedTask(null);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      setInviting(true);
      const res = await projectService.addMember(id!, { email: inviteEmail });
      setActiveProject(res.data);
      setInviteEmail('');
      toast.success('Member added!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await projectService.removeMember(id!, userId);
      setActiveProject(res.data);
      toast.success('Member removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const getAvatar = (name: string, avatar: string) => {
    if (avatar) return `http://localhost:5000${avatar}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`;
  };

  const filterTasks = (tasks: Task[]) => {
    return tasks.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-dark-800 rounded-xl w-80" />
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 h-96 bg-dark-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!activeProject) return null;

  const isOwner = activeProject.owner._id === user?._id;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-dark-700/50 flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/projects')}
          className="btn-ghost p-2 flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0"
            style={{ backgroundColor: activeProject.color }}
          />
          <div>
            <h1 className="font-bold text-dark-50 text-lg leading-none">
              {activeProject.name}
            </h1>
            <p className="text-xs text-dark-500 mt-0.5">{activeProject.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-sm py-2 w-48"
              placeholder="Search tasks..."
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input text-sm py-2 w-36"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Members avatars */}
          <div
            className="flex -space-x-2 cursor-pointer"
            onClick={() => setShowMembers(!showMembers)}
          >
            {activeProject.members.slice(0, 4).map((m) => (
              <img
                key={m.user._id}
                src={getAvatar(m.user.name, m.user.avatar)}
                alt={m.user.name}
                title={m.user.name}
                className="w-8 h-8 rounded-full ring-2 ring-dark-900"
              />
            ))}
            {activeProject.members.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-dark-700 ring-2 ring-dark-900 flex items-center justify-center text-xs text-dark-300">
                +{activeProject.members.length - 4}
              </div>
            )}
          </div>

          {/* Invite */}
          {isOwner && (
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="btn-secondary flex items-center gap-2 text-sm py-2"
            >
              <UserPlus size={15} />
              Invite
            </button>
          )}

          {/* Add Task */}
          <button
            onClick={() => {
              setCreateStatus('todo');
              setShowCreateTask(true);
            }}
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            <Plus size={15} />
            Add Task
          </button>
        </div>
      </div>

      {/* Invite bar */}
      {showInvite && (
        <div className="px-6 py-3 bg-dark-800/50 border-b border-dark-700/50 flex items-center gap-3">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            className="input text-sm py-2 max-w-xs"
            placeholder="Enter email to invite..."
          />
          <button onClick={handleInvite} disabled={inviting} className="btn-primary text-sm py-2">
            {inviting ? 'Adding...' : 'Add Member'}
          </button>
          <button onClick={() => setShowInvite(false)} className="btn-ghost p-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Members panel */}
      {showMembers && (
        <div className="px-6 py-3 bg-dark-800/50 border-b border-dark-700/50 flex items-center gap-4 flex-wrap">
          <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
            Members
          </span>
          {activeProject.members.map((m) => (
            <div key={m.user._id} className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-1.5">
              <img
                src={getAvatar(m.user.name, m.user.avatar)}
                alt={m.user.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-dark-200">{m.user.name}</span>
              <span className="text-xs text-dark-500">({m.role})</span>
              {isOwner && m.user._id !== user?._id && (
                <button
                  onClick={() => handleRemoveMember(m.user._id)}
                  className="text-dark-500 hover:text-red-400 ml-1"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 p-6 h-full min-h-0">
            {COLUMNS.map((col) => {
              const colTasks = filterTasks(tasksByStatus[col.id] || []);
              return (
                <div
                  key={col.id}
                  className="flex-shrink-0 w-72 flex flex-col"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                      <h3 className="font-semibold text-dark-200 text-sm">{col.label}</h3>
                      <span className="text-xs bg-dark-800 text-dark-400 px-1.5 py-0.5 rounded-full font-medium">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCreateStatus(col.id);
                        setShowCreateTask(true);
                      }}
                      className="text-dark-500 hover:text-dark-300 hover:bg-dark-800 rounded-lg p-1.5 transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Droppable column */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`kanban-column flex-1 overflow-y-auto transition-colors ${
                          snapshot.isDraggingOver
                            ? 'border-primary-500/50 bg-primary-500/5'
                            : ''
                        }`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.85 : 1,
                                }}
                                className={`relative ${snapshot.isDragging ? 'rotate-1 shadow-2xl' : ''} transition-transform`}
                              >
                                <TaskCard
                                  task={task}
                                  onClick={(t) => setSelectedTask(t)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div
                            className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-dark-700 rounded-xl cursor-pointer hover:border-dark-500 transition-colors"
                            onClick={() => {
                              setCreateStatus(col.id);
                              setShowCreateTask(true);
                            }}
                          >
                            <Plus size={16} className="text-dark-600" />
                            <span className="text-xs text-dark-600 mt-1">Add task</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          project={activeProject}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdated}
          onDelete={handleTaskDeleted}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          project={activeProject}
          defaultStatus={createStatus}
          onClose={() => setShowCreateTask(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default BoardPage;
