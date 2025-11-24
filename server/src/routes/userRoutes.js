const express = require('express');
const { listUsers, createUser, changePassword } = require('../controllers/userController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Change password route - accessible to all authenticated users
router.put('/change-password', protect, changePassword);

// Admin-only routes
router.use(protect, requireAdmin);

router.route('/').get(listUsers).post(createUser);

module.exports = router;



