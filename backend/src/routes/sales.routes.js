const express = require('express');

const salesController = require('../controllers/sales.controller');
const { authorizeRoles } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(salesController.listSales));
router.get('/:id', asyncHandler(salesController.getSaleById));
router.post('/', authorizeRoles('admin', 'gerente', 'operador'), asyncHandler(salesController.createSale));
router.post('/:id/cancel', authorizeRoles('admin', 'gerente'), asyncHandler(salesController.cancelSale));

module.exports = router;
