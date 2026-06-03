const express = require('express');

const productsController = require('../controllers/products.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(productsController.listProducts));
router.get('/:id', asyncHandler(productsController.getProductById));
router.post('/', authorizeRoles('admin'), asyncHandler(productsController.createProduct));
router.put('/:id', authorizeRoles('admin'), asyncHandler(productsController.updateProduct));
router.delete('/:id', authorizeRoles('admin'), asyncHandler(productsController.deleteProduct));

module.exports = router;
