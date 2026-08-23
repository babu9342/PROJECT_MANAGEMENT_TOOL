const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTask,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
  reorderTasks,
  getDashboardStats,
} = require('../controllers/taskController');

router.get('/stats', protect, getDashboardStats);
router.put('/reorder', protect, reorderTasks);
router.route('/').post(protect, createTask);
router.route('/detail/:id').get(protect, getTask);
router.route('/:projectId').get(protect, getTasksByProject);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
