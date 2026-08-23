import React, { useState } from 'react';
import { X } from 'lucide-react';
import { projectService } from '../services/services';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: (project: any) => void;
}

const PROJECT_COLORS = [
  '#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#3B82F6',
];

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6366F1',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    try {
      setLoading(true);
      const res = await projectService.create({
        name: form.name,
        description: form.description,
        color: form.color,
        dueDate: form.dueDate || undefined,
      });
      onCreated(res.data);
      toast.success('Project created!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-dark-100">Create Project</h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Color picker + name preview */}
          <div className="flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-600">
            <div
              className="w-12 h-12 rounded-xl flex-shrink-0 shadow-lg"
              style={{ backgroundColor: form.color }}
            />
            <div>
              <p className="font-semibold text-dark-100">{form.name || 'Project Name'}</p>
              <p className="text-xs text-dark-400">{form.description || 'Project description'}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
              Project Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="e.g. Website Redesign"
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
              placeholder="What is this project about?"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
              Due Date (optional)
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create Project'}
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

export default CreateProjectModal;
