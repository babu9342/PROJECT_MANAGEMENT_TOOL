import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinUserRoom = (userId: string) => {
  const s = getSocket();
  s.emit('join', userId);
};

export const joinProjectRoom = (projectId: string) => {
  const s = getSocket();
  s.emit('joinProject', projectId);
};

export const leaveProjectRoom = (projectId: string) => {
  const s = getSocket();
  s.emit('leaveProject', projectId);
};

export const emitTaskMoved = (data: any) => {
  const s = getSocket();
  s.emit('taskMoved', data);
};

export const emitTaskUpdated = (data: any) => {
  const s = getSocket();
  s.emit('taskUpdated', data);
};

export const emitTaskCreated = (data: any) => {
  const s = getSocket();
  s.emit('taskCreated', data);
};

export const emitTaskDeleted = (data: any) => {
  const s = getSocket();
  s.emit('taskDeleted', data);
};

export const emitNewComment = (data: any) => {
  const s = getSocket();
  s.emit('newComment', data);
};
