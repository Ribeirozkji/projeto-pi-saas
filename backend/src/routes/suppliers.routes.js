const express = require('express');

const suppliersController = require('../controllers/suppliers.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(suppliersController.listSuppliers));
router.get('/:id', asyncHandler(suppliersController.getSupplierById));
router.post('/', authorizeRoles('admin'), asyncHandler(suppliersController.createSupplier));
router.put('/:id', authorizeRoles('admin'), asyncHandler(suppliersController.updateSupplier));
router.delete('/:id', authorizeRoles('admin'), asyncHandler(suppliersController.deleteSupplier));

module.exports = router;
