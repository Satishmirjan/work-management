const express = require('express');
const { listUsers, createUser } = require('../controllers/userController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireAdmin);

router.route('/').get(listUsers).post(createUser);

module.exports = router;


