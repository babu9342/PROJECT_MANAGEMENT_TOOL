import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Flag,
  Tag,
  CheckSquare,
  Square,
  Trash2,
  Send,
  Edit2,
  Check,
  MessageSquare,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Task } from '../store/taskStore';
import { Project } from '../store/projectStore';
import { taskService, commentService } from '../services/services';
import { useAuthStore } from '../store/authStore';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  text: string;
  user: { _id: string; name: string; avatar: string };
  edited: boolean;
  createdAt: string;
}

interface TaskDetailModalProps {
  task: Task;
  project: Project;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityOptions = ['low', 'medium', 'high', 'critical'];
const statusOptions = ['backlog', 'todo', 'inprogress', 'review', 'done'];
const statusLabels: Record<string, string> = {
  backlog: 'Backlog', todo: 'To Do', inprogress: 'In Progress', review: 'Review', done: 'Done'
};

const getAvatar = (name: string, avatar: string) => {
  if (avatar) return `http://localhost:5000${avatar}`;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`;
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task: initialTask,
  project,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task>(initialTask);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [descValue, setDescValue] = useState(task.description);
  const [editDesc, setEditDesc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    fetchComments();
  }, [task._id]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await commentService.getByTask(task._id);
      setComments(res.data);
    } catch {
    } finally {
      setLoadingComments(false);
    }
  };

  const handleUpdate = async (updates: Partial<Task>) => {
    try {
      setSaving(true);
      const res = await taskService.update(task._id, updates);
      setTask(res.data);
      onUpdate(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTitle = () => {
    if (titleValue.trim() && titleValue !== task.title) {
      handleUpdate({ title: titleValue.trim() } as any);
    }
    setEditTitle(false);
  };

  const handleSaveDesc = () => {
    if (descValue !== task.description) {
      handleUpdate({ description: descValue } as any);
    }
    setEditDesc(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await commentService.add({ taskId: task._id, text: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await commentService.delete(id);
      setComments(comments.filter((c) => c._id !== id));
    } catch {}
  };

  const handleToggleChecklist = (index: number) => {
    const updated = task.checklist.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    const updatedTask = { ...task, checklist: updated };
    setTask(updatedTask);
    handleUpdate({ checklist: updated } as any);
  };

  const handleAddChecklist = () => {
    if (!newChecklistItem.trim()) return;
    const updated = [...task.checklist, { text: newChecklistItem, completed: false }];
    const updatedTask = { ...task, checklist: updated };
    setTask(updatedTask);
    handleUpdate({ checklist: updated } as any);
    setNewChecklistItem('');
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    const updated = [...task.labels, newLabel.trim()];
    const updatedTask = { ...task, labels: updated };
    setTask(updatedTask);
    handleUpdate({ labels: updated } as any);
    setNewLabel('');
    setShowLabelInput(false);
  };

  const handleRemoveLabel = (label: string) => {
    const updated = task.labels.filter((l) => l !== label);
    const updatedTask = { ...task, labels: updated };
    setTask(updatedTask);
    handleUpdate({ labels: updated } as any);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.delete(task._id);
      onDelete(task._id);
      onClose();
      toast.success('Task deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const completedChecklist = task.checklist?.filter((c) => c.completed).length || 0;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs text-dark-400 font-medium truncate">{project.name}</span>
            {saving && <span className="text-xs text-primary-400 animate-pulse">Saving...</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="btn-ghost text-red-400 p-2">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="btn-ghost p-2">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Title */}
            {editTitle ? (
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="input text-lg font-semibold flex-1"
                  autoFocus
                />
                <button onClick={handleSaveTitle} className="btn-primary px-3 py-2">
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <h2
                onClick={() => setEditTitle(true)}
                className="text-xl font-semibold text-dark-50 mb-4 cursor-pointer hover:text-white transition-colors group"
              >
                {task.title}
                <Edit2 size={14} className="inline ml-2 opacity-0 group-hover:opacity-100 text-dark-400" />
              </h2>
            )}

            {/* Labels */}
            <div className="flex flex-wrap gap-2 mb-4">
              {task.labels?.map((label) => (
                <span
                  key={label}
                  className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 flex items-center gap-1"
                >
                  <Tag size={10} />
                  {label}
                  <button onClick={() => handleRemoveLabel(label)} className="hover:text-red-400 ml-1">
                    <X size={10} />
                  </button>
                </span>
              ))}
              {showLabelInput ? (
                <div className="flex items-center gap-1">
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                    placeholder="Label name..."
                    className="input text-xs py-1 px-2 w-28"
                    autoFocus
                  />
                  <button onClick={handleAddLabel} className="text-primary-400 hover:text-primary-300">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setShowLabelInput(false)} className="text-dark-400 hover:text-dark-200">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLabelInput(true)}
                  className="text-xs text-dark-500 hover:text-dark-300 flex items-center gap-1 px-2 py-1 border border-dashed border-dark-600 rounded-full"
                >
                  <Tag size={10} />
                  Add label
                </button>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              {editDesc ? (
                <div>
                  <textarea
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    className="input min-h-[100px] resize-none"
                    placeholder="Add a description..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleSaveDesc} className="btn-primary text-sm px-4 py-1.5">
                      Save
                    </button>
                    <button onClick={() => setEditDesc(false)} className="btn-secondary text-sm px-4 py-1.5">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditDesc(true)}
                  className="text-sm text-dark-300 leading-relaxed cursor-pointer hover:bg-dark-800 rounded-lg p-3 min-h-[60px] border border-transparent hover:border-dark-600 transition-all"
                >
                  {task.description || (
                    <span className="text-dark-500 italic">Click to add description...</span>
                  )}
                </div>
              )}
            </div>

            {/* Checklist */}
            {(task.checklist?.length > 0 || true) && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare size={14} />
                    Checklist
                    {task.checklist?.length > 0 && (
                      <span className="text-dark-500">
                        {completedChecklist}/{task.checklist.length}
                      </span>
                    )}
                  </h3>
                </div>
                {task.checklist?.length > 0 && (
                  <div className="mb-2">
                    <div className="progress-bar mb-3">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(completedChecklist / task.checklist.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {task.checklist?.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => handleToggleChecklist(i)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800 cursor-pointer group"
                    >
                      {item.completed ? (
                        <CheckSquare size={16} className="text-primary-500 flex-shrink-0" />
                      ) : (
                        <Square size={16} className="text-dark-500 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm flex-1 ${
                          item.completed ? 'line-through text-dark-500' : 'text-dark-200'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                    placeholder="Add checklist item..."
                    className="input text-sm py-2 flex-1"
                  />
                  <button onClick={handleAddChecklist} className="btn-secondary text-sm px-3 py-2">
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageSquare size={14} />
                Comments ({comments.length})
              </h3>
              <div className="space-y-4 mb-4">
                {loadingComments ? (
                  <div className="text-sm text-dark-500">Loading...</div>
                ) : comments.length === 0 ? (
                  <div className="text-sm text-dark-500 italic text-center py-4">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <img
                        src={getAvatar(comment.user.name, comment.user.avatar)}
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-dark-200">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-dark-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                          {comment.edited && (
                            <span className="text-xs text-dark-500">(edited)</span>
                          )}
                        </div>
                        <div className="bg-dark-800 rounded-xl p-3 text-sm text-dark-200 group relative">
                          {comment.text}
                          {comment.user._id === user?._id && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-dark-500 hover:text-red-400 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* New comment */}
              <div className="flex gap-3">
                <img
                  src={getAvatar(user?.name || '', user?.avatar || '')}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                    placeholder="Write a comment..."
                    className="input text-sm flex-1"
                  />
                  <button onClick={handleAddComment} className="btn-primary px-3">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar details */}
          <div className="w-64 border-l border-dark-700 p-5 space-y-5 overflow-y-auto flex-shrink-0">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-2">
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) => {
                  const updated = { ...task, status: e.target.value as Task['status'] };
                  setTask(updated);
                  handleUpdate({ status: e.target.value as any } as any);
                }}
                className="input text-sm py-2"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Flag size={12} />
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) => {
                  const updated = { ...task, priority: e.target.value as Task['priority'] };
                  setTask(updated);
                  handleUpdate({ priority: e.target.value as any } as any);
                }}
                className="input text-sm py-2"
              >
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <User size={12} />
                Assignee
              </label>
              <select
                value={task.assignedTo?._id || ''}
                onChange={(e) => {
                  const updated = { ...task, assignedTo: e.target.value || null } as any;
                  setTask(updated);
                  handleUpdate({ assignedTo: e.target.value || null } as any);
                }}
                className="input text-sm py-2"
              >
                <option value="">Unassigned</option>
                {project.members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
              {task.assignedTo && (
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={getAvatar(task.assignedTo.name, task.assignedTo.avatar)}
                    alt={task.assignedTo.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-dark-300">{task.assignedTo.name}</span>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Calendar size={12} />
                Due Date
                {isOverdue && <AlertCircle size={12} className="text-red-400" />}
              </label>
              <input
                type="date"
                value={task.dueDate ? task.dueDate.substring(0, 10) : ''}
                onChange={(e) => {
                  const updated = { ...task, dueDate: e.target.value || null };
                  setTask(updated);
                  handleUpdate({ dueDate: e.target.value || null } as any);
                }}
                className={`input text-sm py-2 ${isOverdue ? 'border-red-500/50 text-red-400' : ''}`}
              />
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-dark-700 space-y-2">
              <div className="text-xs text-dark-500 flex items-center gap-1">
                <Clock size={11} />
                Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </div>
              {task.createdBy && (
                <div className="text-xs text-dark-500 flex items-center gap-2">
                  <img
                    src={getAvatar(task.createdBy.name, task.createdBy.avatar)}
                    alt=""
                    className="w-4 h-4 rounded-full"
                  />
                  by {task.createdBy.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
