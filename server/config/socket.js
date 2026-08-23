const Notification = require('../models/Notification');

const initializeSocket = (io) => {
  // Track online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins their personal room
    socket.on('join', (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log(`👤 User ${userId} joined`);
    });

    // Join project room for board sync
    socket.on('joinProject', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`📋 Socket joined project: ${projectId}`);
    });

    // Leave project room
    socket.on('leaveProject', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Task moved (drag-drop)
    socket.on('taskMoved', (data) => {
      socket.to(`project:${data.projectId}`).emit('taskMoved', data);
    });

    // Task updated
    socket.on('taskUpdated', (data) => {
      socket.to(`project:${data.projectId}`).emit('taskUpdated', data);
    });

    // Task created
    socket.on('taskCreated', (data) => {
      socket.to(`project:${data.projectId}`).emit('taskCreated', data);
    });

    // Task deleted
    socket.on('taskDeleted', (data) => {
      socket.to(`project:${data.projectId}`).emit('taskDeleted', data);
    });

    // New comment
    socket.on('newComment', (data) => {
      socket.to(`project:${data.projectId}`).emit('newComment', data);
    });

    // Send notification to specific user
    socket.on('sendNotification', async (data) => {
      const { receiverId, notification } = data;
      io.to(receiverId).emit('notification', notification);
    });

    // Typing indicator for comments
    socket.on('typing', (data) => {
      socket.to(`project:${data.projectId}`).emit('typing', data);
    });

    socket.on('stopTyping', (data) => {
      socket.to(`project:${data.projectId}`).emit('stopTyping', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Find and remove the user from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
