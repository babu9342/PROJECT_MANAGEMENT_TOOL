const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_updated',
        'task_commented',
        'project_invite',
        'task_due_soon',
        'task_overdue',
        'mention',
        'status_changed',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ receiver: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
