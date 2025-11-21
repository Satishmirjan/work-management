const express = require('express');
const { createLookupValue, getLookupValues, deleteLookupValue } = require('../controllers/lookupController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getLookupValues).post(requireAdmin, createLookupValue);
router.route('/:id').delete(requireAdmin, deleteLookupValue);

module.exports = router;


