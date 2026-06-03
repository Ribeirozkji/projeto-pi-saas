const express = require('express');

const productsController = require('../controllers/products.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(productsController.listProducts));
router.get('/:id', asyncHandler(productsController.getProductById));
router.post('/', asyncHandler(productsController.createProduct));
router.put('/:id', asyncHandler(productsController.updateProduct));
router.delete('/:id', asyncHandler(productsController.deleteProduct));

module.exports = router;
