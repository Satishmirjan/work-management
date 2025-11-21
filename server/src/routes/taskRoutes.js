const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  getTaskOptions,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/stats').get(getTaskStats);
router.route('/options').get(getTaskOptions);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

module.exports = router;

