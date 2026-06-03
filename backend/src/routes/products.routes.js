const express = require('express');

const productsController = require('../controllers/products.controller');
const { authorizeRoles } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(productsController.listProducts));
router.get('/:id', asyncHandler(productsController.getProductById));
router.post('/', authorizeRoles('admin', 'gerente'), asyncHandler(productsController.createProduct));
router.put('/:id', authorizeRoles('admin', 'gerente'), asyncHandler(productsController.updateProduct));
router.delete('/:id', authorizeRoles('admin'), asyncHandler(productsController.deleteProduct));

module.exports = router;
