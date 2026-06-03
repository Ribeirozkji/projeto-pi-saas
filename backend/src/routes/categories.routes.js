const express = require('express');

const categoriesController = require('../controllers/categories.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(categoriesController.listCategories));
router.get('/:id', asyncHandler(categoriesController.getCategoryById));
router.post('/', asyncHandler(categoriesController.createCategory));
router.put('/:id', asyncHandler(categoriesController.updateCategory));
router.delete('/:id', asyncHandler(categoriesController.deleteCategory));

module.exports = router;
