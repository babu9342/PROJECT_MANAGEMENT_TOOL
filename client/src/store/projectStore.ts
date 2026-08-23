import { create } from 'zustand';

export interface Member {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  role: 'admin' | 'member' | 'viewer';
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string; email: string; avatar: string };
  members: Member[];
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  color: string;
  dueDate?: string;
  totalTasks?: number;
  completedTasks?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProject: null,
  loading: false,

  setProjects: (projects) => set({ projects }),
  setActiveProject: (project) => set({ activeProject: project }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p._id === project._id ? project : p)),
      activeProject:
        state.activeProject?._id === project._id ? project : state.activeProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p._id !== id),
      activeProject: state.activeProject?._id === id ? null : state.activeProject,
    })),

  setLoading: (loading) => set({ loading }),
}));
