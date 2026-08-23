const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, color, dueDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      color: color || '#6366F1',
      dueDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    await project.populate('members.user', 'name email avatar');
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    let query = {
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    };

    if (status) query.status = status;
    if (search) {
      query.$and = [
        { $or: [{ owner: req.user._id }, { 'members.user': req.user._id }] },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        },
      ];
      delete query.$or;
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });

    // Add task counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const total = await Task.countDocuments({ project: project._id });
        const done = taskCounts.find((t) => t._id === 'done')?.count || 0;
        return {
          ...project.toObject(),
          taskCounts,
          totalTasks: total,
          completedTasks: done,
          progress: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    const isMember = project.members.some(
      (m) => m.user && m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember && project.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only admin/owner can update
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (
      project.owner.toString() !== req.user._id.toString() &&
      (!member || member.role !== 'admin')
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, status, color, dueDate } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (color) project.color = color;
    if (dueDate !== undefined) project.dueDate = dueDate;

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    // Delete all related tasks and comments
    const tasks = await Task.find({ project: project._id });
    const taskIds = tasks.map((t) => t._id);

    const Comment = require('../models/Comment');
    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });
    await Notification.deleteMany({ project: project._id });
    await Project.deleteOne({ _id: project._id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if requester is admin
    const requesterMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (
      project.owner.toString() !== req.user._id.toString() &&
      (!requesterMember || requesterMember.role !== 'admin')
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({ user: userToAdd._id, role: role || 'member' });
    await project.save();

    // Create notification
    await Notification.create({
      receiver: userToAdd._id,
      sender: req.user._id,
      type: 'project_invite',
      message: `${req.user.name} added you to project "${project.name}"`,
      project: project._id,
    });

    await project.populate('members.user', 'name email avatar');
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
