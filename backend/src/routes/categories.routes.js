const express = require('express');

const categoriesController = require('../controllers/categories.controller');
const { authorizeRoles } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(categoriesController.listCategories));
router.get('/:id', asyncHandler(categoriesController.getCategoryById));
router.post('/', authorizeRoles('admin', 'gerente'), asyncHandler(categoriesController.createCategory));
router.put('/:id', authorizeRoles('admin', 'gerente'), asyncHandler(categoriesController.updateCategory));
router.delete('/:id', authorizeRoles('admin'), asyncHandler(categoriesController.deleteCategory));

module.exports = router;
