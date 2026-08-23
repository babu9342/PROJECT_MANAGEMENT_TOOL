import api from './api';

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (data: FormData) =>
    api.put('/auth/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  searchUsers: (q: string) => api.get(`/auth/search?q=${q}`),
};

export const projectService = {
  create: (data: any) => api.post('/projects', data),
  getAll: (params?: any) => api.get('/projects', { params }),
  getOne: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, data: { email: string; role?: string }) =>
    api.post(`/projects/${id}/members`, data),
  removeMember: (id: string, userId: string) =>
    api.delete(`/projects/${id}/members/${userId}`),
};

export const taskService = {
  create: (data: any) => api.post('/tasks', data),
  getByProject: (projectId: string, params?: any) =>
    api.get(`/tasks/${projectId}`, { params }),
  getOne: (id: string) => api.get(`/tasks/detail/${id}`),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  reorder: (tasks: { id: string; status: string; order: number }[]) =>
    api.put('/tasks/reorder', { tasks }),
  getStats: () => api.get('/tasks/stats'),
};

export const commentService = {
  add: (data: { taskId: string; text: string }) => api.post('/comments', data),
  getByTask: (taskId: string) => api.get(`/comments/${taskId}`),
  update: (id: string, data: { text: string }) => api.put(`/comments/${id}`, data),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
