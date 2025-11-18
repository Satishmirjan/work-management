const express = require('express');
const { createLookupValue, getLookupValues } = require('../controllers/lookupController');

const router = express.Router();

router.route('/').get(getLookupValues).post(createLookupValue);

module.exports = router;


