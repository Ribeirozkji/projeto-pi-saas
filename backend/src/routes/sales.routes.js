const express = require('express');

const salesController = require('../controllers/sales.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(salesController.listSales));
router.get('/:id', asyncHandler(salesController.getSaleById));
router.post('/', asyncHandler(salesController.createSale));
router.post('/:id/cancel', asyncHandler(salesController.cancelSale));

module.exports = router;
