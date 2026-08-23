const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, priority, status, dueDate, labels } =
      req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    // Verify project membership
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'Not a project member' });

    // Get max order in the column
    const maxOrderTask = await Task.findOne({
      project: projectId,
      status: status || 'todo',
    }).sort({ order: -1 });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate || null,
      labels: labels || [],
      order,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    // Notify assigned user
    if (assignedTo && assignedTo !== req.user._id.toString()) {
      const notification = await Notification.create({
        receiver: assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        message: `${req.user.name} assigned you task "${title}" in "${project.name}"`,
        task: task._id,
        project: projectId,
      });

      // Emit via socket if available
      if (req.app.get('io')) {
        req.app.get('io').to(assignedTo).emit('notification', notification);
      }
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks by project
// @route   GET /api/tasks/:projectId
// @access  Private
const getTasksByProject = async (req, res, next) => {
  try {
    const { priority, assignedTo, search } = req.query;

    const query = { project: req.params.projectId };
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/detail/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color members');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const previousStatus = task.status;
    const previousAssignee = task.assignedTo?.toString();

    const {
      title,
      description,
      assignedTo,
      priority,
      status,
      dueDate,
      labels,
      checklist,
      order,
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (labels !== undefined) task.labels = labels;
    if (checklist !== undefined) task.checklist = checklist;
    if (order !== undefined) task.order = order;

    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    // Notify on assignment change
    if (
      assignedTo &&
      assignedTo !== previousAssignee &&
      assignedTo !== req.user._id.toString()
    ) {
      const notification = await Notification.create({
        receiver: assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        message: `${req.user.name} assigned you task "${task.title}"`,
        task: task._id,
        project: task.project._id,
      });
      if (req.app.get('io')) {
        req.app.get('io').to(assignedTo).emit('notification', notification);
      }
    }

    // Notify on status change
    if (status && status !== previousStatus && task.assignedTo) {
      const receiverId = task.assignedTo._id?.toString() || task.assignedTo.toString();
      if (receiverId !== req.user._id.toString()) {
        const notification = await Notification.create({
          receiver: receiverId,
          sender: req.user._id,
          type: 'status_changed',
          message: `Task "${task.title}" moved to ${status}`,
          task: task._id,
          project: task.project._id || task.project,
        });
        if (req.app.get('io')) {
          req.app.get('io').to(receiverId).emit('notification', notification);
        }
      }
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const Comment = require('../models/Comment');
    await Comment.deleteMany({ task: task._id });
    await Notification.deleteMany({ task: task._id });
    await Task.deleteOne({ _id: task._id });

    res.json({ message: 'Task deleted successfully', taskId: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder/move tasks (drag and drop)
// @route   PUT /api/tasks/reorder
// @access  Private
const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // Array of { id, status, order }

    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t.id },
        update: { $set: { status: t.status, order: t.order } },
      },
    }));

    await Task.bulkWrite(bulkOps);
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats for user
// @route   GET /api/tasks/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    // Get user's projects
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    });
    const projectIds = projects.map((p) => p._id);

    const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds }, assignedTo: req.user._id }),
      Task.countDocuments({
        project: { $in: projectIds },
        assignedTo: req.user._id,
        status: 'done',
      }),
      Task.countDocuments({
        project: { $in: projectIds },
        assignedTo: req.user._id,
        status: 'inprogress',
      }),
      Task.countDocuments({
        project: { $in: projectIds },
        assignedTo: req.user._id,
        status: { $ne: 'done' },
        dueDate: { $lt: new Date() },
      }),
    ]);

    // Recent activity (latest 10 tasks across all user's projects)
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name avatar')
      .populate('project', 'name color')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      pendingTasks: totalTasks - completedTasks,
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
  reorderTasks,
  getDashboardStats,
};
