const express = require('express');

const categoriesController = require('../controllers/categories.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(categoriesController.listCategories));
router.get('/:id', asyncHandler(categoriesController.getCategoryById));
router.post('/', authorizeRoles('admin'), asyncHandler(categoriesController.createCategory));
router.put('/:id', authorizeRoles('admin'), asyncHandler(categoriesController.updateCategory));
router.delete('/:id', authorizeRoles('admin'), asyncHandler(categoriesController.deleteCategory));

module.exports = router;
