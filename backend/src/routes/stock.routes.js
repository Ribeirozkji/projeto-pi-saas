const express = require('express');

const stockController = require('../controllers/stock.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/movements', asyncHandler(stockController.listMovements));
router.post('/movements', asyncHandler(stockController.createMovement));
router.get('/low-stock', asyncHandler(stockController.listLowStock));
router.get('/near-expiration', asyncHandler(stockController.listNearExpiration));

module.exports = router;
