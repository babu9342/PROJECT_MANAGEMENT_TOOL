const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .populate('sender', 'name avatar')
      .populate('task', 'title')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      receiver: req.user._id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      receiver: req.user._id,
    });

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, receiver: req.user._id });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
