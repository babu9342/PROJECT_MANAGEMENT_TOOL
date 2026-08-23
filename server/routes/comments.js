const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addComment,
  getComments,
  deleteComment,
  updateComment,
} = require('../controllers/commentController');

router.route('/').post(protect, addComment);
router.route('/:taskId').get(protect, getComments);
router.route('/:id').put(protect, updateComment).delete(protect, deleteComment);

module.exports = router;
