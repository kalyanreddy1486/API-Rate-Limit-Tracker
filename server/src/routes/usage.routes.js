const express = require('express');
const { trackUsage, getUsageHistory } = require('../controllers/usage.controller');
const { validate, validateQuery } = require('../middlewares/validation.middleware');
const { trackUsageSchema, getUsageHistorySchema } = require('../schemas/usage.schema');
const authMiddleware = require('../middlewares/auth.middleware');
const { usageTrackerLimiter, apiLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/track', usageTrackerLimiter, validate(trackUsageSchema), trackUsage);
router.get('/history/:apiId', apiLimiter, validateQuery(getUsageHistorySchema), getUsageHistory);

module.exports = router;
