const express = require('express');

const suppliersController = require('../controllers/suppliers.controller');
const { authorizeRoles } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(suppliersController.listSuppliers));
router.get('/:id', asyncHandler(suppliersController.getSupplierById));
router.post('/', authorizeRoles('admin', 'gerente'), asyncHandler(suppliersController.createSupplier));
router.put('/:id', authorizeRoles('admin', 'gerente'), asyncHandler(suppliersController.updateSupplier));
router.delete('/:id', authorizeRoles('admin'), asyncHandler(suppliersController.deleteSupplier));

module.exports = router;
