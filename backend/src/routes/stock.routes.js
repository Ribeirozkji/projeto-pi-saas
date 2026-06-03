const express = require('express');

const stockController = require('../controllers/stock.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/movements', asyncHandler(stockController.listMovements));
router.post('/movements', authorizeRoles('admin'), asyncHandler(stockController.createMovement));
router.get('/low-stock', asyncHandler(stockController.listLowStock));
router.get('/near-expiration', asyncHandler(stockController.listNearExpiration));

module.exports = router;
