const express = require('express');

const usersController = require('../controllers/users.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(usersController.listUsers));
router.post('/', asyncHandler(usersController.createUser));
router.put('/:id', asyncHandler(usersController.updateUser));
router.delete('/:id', asyncHandler(usersController.deleteUser));

module.exports = router;
