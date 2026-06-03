const express = require('express');

const dashboardController = require('../controllers/dashboard.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(dashboardController.getDashboard));

module.exports = router;
