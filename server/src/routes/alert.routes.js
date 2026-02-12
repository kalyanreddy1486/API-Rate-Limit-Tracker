const express = require('express');
const {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} = require('../controllers/alert.controller');
const { validate } = require('../middlewares/validation.middleware');
const { createAlertSchema, updateAlertSchema } = require('../schemas/alert.schema');
const authMiddleware = require('../middlewares/auth.middleware');
const { apiLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(apiLimiter);

router.get('/', getAlerts);
router.post('/', validate(createAlertSchema), createAlert);
router.put('/:id', validate(updateAlertSchema), updateAlert);
router.delete('/:id', deleteAlert);

module.exports = router;
