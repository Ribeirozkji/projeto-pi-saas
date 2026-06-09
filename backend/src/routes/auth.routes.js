const express = require('express');

const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createRateLimiter, requireCookieCsrfHeader } = require('../middlewares/security.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const loginRateLimiter = createRateLimiter({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  message: 'Muitas tentativas de login. Aguarde antes de tentar novamente.'
});

router.post('/login', loginRateLimiter, asyncHandler(authController.login));
router.post('/logout', authMiddleware, requireCookieCsrfHeader, asyncHandler(authController.logout));
router.get('/me', authMiddleware, asyncHandler(authController.me));

module.exports = router;
