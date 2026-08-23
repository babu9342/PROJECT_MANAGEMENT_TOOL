import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Project } from '../store/projectStore';
import { taskService } from '../services/services';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface CreateTaskModalProps {
  project: Project;
  defaultStatus?: string;
  onClose: () => void;
  onCreated: (task: any) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  project,
  defaultStatus = 'todo',
  onClose,
  onCreated,
}) => {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    status: defaultStatus,
    dueDate: '',
    labels: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    try {
      setLoading(true);
      const res = await taskService.create({
        title: form.title,
        description: form.description,
        projectId: project._id,
        assignedTo: form.assignedTo || null,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
        labels: form.labels ? form.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      });
      onCreated(res.data);
      toast.success('Task created!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-dark-100">Create Task</h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input min-h-[80px] resize-none"
              placeholder="Add more details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
                Assign To
              </label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="input"
              >
                <option value="">Unassigned</option>
                {project.members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name} {m.user._id === user?._id ? '(me)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
              Labels (comma separated)
            </label>
            <input
              value={form.labels}
              onChange={(e) => setForm({ ...form, labels: e.target.value })}
              className="input"
              placeholder="bug, feature, design"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
