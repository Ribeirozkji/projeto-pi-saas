const express = require('express');

const suppliersController = require('../controllers/suppliers.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(suppliersController.listSuppliers));
router.get('/:id', asyncHandler(suppliersController.getSupplierById));
router.post('/', asyncHandler(suppliersController.createSupplier));
router.put('/:id', asyncHandler(suppliersController.updateSupplier));
router.delete('/:id', asyncHandler(suppliersController.deleteSupplier));

module.exports = router;
