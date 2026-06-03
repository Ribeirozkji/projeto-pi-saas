const express = require('express');

const reportsController = require('../controllers/reports.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/stock', asyncHandler(reportsController.stockReport));
router.get('/movements', asyncHandler(reportsController.movementsReport));
router.get('/sales', asyncHandler(reportsController.salesReport));

module.exports = router;
