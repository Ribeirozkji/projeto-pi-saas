const express = require('express');

const authController = require('../controllers/auth.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/login', asyncHandler(authController.login));
router.get('/me', asyncHandler(authController.me));

module.exports = router;
