const express = require('express');

const salesController = require('../controllers/sales.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(salesController.listSales));
router.get('/:id', asyncHandler(salesController.getSaleById));
router.post('/', asyncHandler(salesController.createSale));
router.post('/:id/cancel', asyncHandler(salesController.cancelSale));

module.exports = router;
