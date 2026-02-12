const express = require('express');
const { signup, login, logout } = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validation.middleware');
const { signupSchema, loginSchema } = require('../schemas/auth.schema');
const { authLimiter, signupLimiter } = require('../middlewares/rateLimiter.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/signup', signupLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authMiddleware, logout);

module.exports = router;
