import { create } from 'zustand';

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string | { _id: string; name: string; color: string };
  assignedTo: null | { _id: string; name: string; email: string; avatar: string };
  createdBy: { _id: string; name: string; email: string; avatar: string };
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'todo' | 'inprogress' | 'review' | 'done';
  dueDate: string | null;
  order: number;
  labels: string[];
  checklist: { text: string; completed: boolean; _id?: string }[];
  attachments: any[];
  createdAt: string;
  updatedAt: string;
}

export type TasksByStatus = Record<Task['status'], Task[]>;

interface TaskState {
  tasks: Task[];
  tasksByStatus: TasksByStatus;
  loading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: Task['status'], newOrder: number) => void;
  setLoading: (loading: boolean) => void;
}

const groupByStatus = (tasks: Task[]): TasksByStatus => {
  const groups: TasksByStatus = {
    backlog: [],
    todo: [],
    inprogress: [],
    review: [],
    done: [],
  };
  tasks.forEach((task) => {
    if (groups[task.status]) {
      groups[task.status].push(task);
    }
  });
  // Sort each group by order
  Object.keys(groups).forEach((status) => {
    groups[status as Task['status']].sort((a, b) => a.order - b.order);
  });
  return groups;
};

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  tasksByStatus: { backlog: [], todo: [], inprogress: [], review: [], done: [] },
  loading: false,

  setTasks: (tasks) =>
    set({ tasks, tasksByStatus: groupByStatus(tasks) }),

  addTask: (task) =>
    set((state) => {
      const newTasks = [task, ...state.tasks];
      return { tasks: newTasks, tasksByStatus: groupByStatus(newTasks) };
    }),

  updateTask: (task) =>
    set((state) => {
      const newTasks = state.tasks.map((t) => (t._id === task._id ? task : t));
      return { tasks: newTasks, tasksByStatus: groupByStatus(newTasks) };
    }),

  removeTask: (id) =>
    set((state) => {
      const newTasks = state.tasks.filter((t) => t._id !== id);
      return { tasks: newTasks, tasksByStatus: groupByStatus(newTasks) };
    }),

  moveTask: (taskId, newStatus, newOrder) =>
    set((state) => {
      const newTasks = state.tasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus, order: newOrder } : t
      );
      return { tasks: newTasks, tasksByStatus: groupByStatus(newTasks) };
    }),

  setLoading: (loading) => set({ loading }),
}));
