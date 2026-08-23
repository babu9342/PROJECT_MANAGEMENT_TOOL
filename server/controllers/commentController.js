const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

// @desc    Add comment to task
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { taskId, text } = req.body;

    if (!taskId || !text) {
      return res.status(400).json({ message: 'Task ID and comment text are required' });
    }

    const task = await Task.findById(taskId).populate('project').populate('assignedTo');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      text,
    });

    await comment.populate('user', 'name email avatar');

    // Notify task owner/assignee
    const notifyUsers = new Set();
    if (task.assignedTo && task.assignedTo._id?.toString() !== req.user._id.toString()) {
      notifyUsers.add(task.assignedTo._id.toString());
    }
    if (task.createdBy && task.createdBy.toString() !== req.user._id.toString()) {
      notifyUsers.add(task.createdBy.toString());
    }

    for (const userId of notifyUsers) {
      const notification = await Notification.create({
        receiver: userId,
        sender: req.user._id,
        type: 'task_commented',
        message: `${req.user.name} commented on "${task.title}"`,
        task: task._id,
        project: task.project._id || task.project,
      });
      if (req.app.get('io')) {
        req.app.get('io').to(userId).emit('notification', notification);
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a task
// @route   GET /api/comments/:taskId
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.deleteOne({ _id: comment._id });
    res.json({ message: 'Comment deleted', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.text = req.body.text || comment.text;
    comment.edited = true;
    await comment.save();
    await comment.populate('user', 'name email avatar');

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getComments, deleteComment, updateComment };
