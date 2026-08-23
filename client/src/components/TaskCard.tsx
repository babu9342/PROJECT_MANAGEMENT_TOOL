import React from 'react';
import { Task } from '../store/taskStore';
import { Calendar, MessageSquare, Paperclip, AlertCircle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const priorityConfig: Record<string, { label: string; class: string; dot: string }> = {
  low: { label: 'Low', class: 'badge-low', dot: 'bg-emerald-500' },
  medium: { label: 'Medium', class: 'badge-medium', dot: 'bg-amber-500' },
  high: { label: 'High', class: 'badge-high', dot: 'bg-orange-500' },
  critical: { label: 'Critical', class: 'badge-critical', dot: 'bg-red-500' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const completedChecklist = task.checklist?.filter((c) => c.completed).length || 0;
  const totalChecklist = task.checklist?.length || 0;

  const getAvatar = (name: string, avatar: string) => {
    if (avatar) return `http://localhost:5000${avatar}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true&size=32`;
  };

  return (
    <div className="task-card group" onClick={() => onClick(task)}>
      {/* Priority indicator bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${priority.dot}`}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: '8px 0 0 8px' }}
      />

      <div className="pl-1">
        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.slice(0, 2).map((label, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-medium text-dark-100 leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2">
          {task.title}
        </h4>

        {/* Priority Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`badge ${priority.class} text-[10px]`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Due date */}
            {task.dueDate && (
              <div
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                  isOverdue
                    ? 'bg-red-500/15 text-red-400'
                    : isDueToday
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-dark-700 text-dark-400'
                }`}
              >
                {isOverdue && <AlertCircle size={10} />}
                <Calendar size={10} />
                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}

            {/* Checklist */}
            {totalChecklist > 0 && (
              <div className="flex items-center gap-1 text-xs text-dark-500">
                <span className={completedChecklist === totalChecklist ? 'text-emerald-400' : ''}>
                  ✓ {completedChecklist}/{totalChecklist}
                </span>
              </div>
            )}
          </div>

          {/* Assignee avatar */}
          {task.assignedTo && (
            <img
              src={getAvatar(task.assignedTo.name, task.assignedTo.avatar)}
              alt={task.assignedTo.name}
              title={task.assignedTo.name}
              className="w-6 h-6 rounded-full ring-2 ring-dark-900"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
