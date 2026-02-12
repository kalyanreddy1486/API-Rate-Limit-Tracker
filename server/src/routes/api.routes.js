const express = require('express');
const {
  getAllAPIs,
  getAPIById,
  createAPI,
  updateAPI,
  deleteAPI,
} = require('../controllers/api.controller');
const { validate } = require('../middlewares/validation.middleware');
const { createAPISchema, updateAPISchema } = require('../schemas/api.schema');
const authMiddleware = require('../middlewares/auth.middleware');
const { apiLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(apiLimiter);

router.get('/', getAllAPIs);
router.post('/', validate(createAPISchema), createAPI);
router.get('/:id', getAPIById);
router.put('/:id', validate(updateAPISchema), updateAPI);
router.delete('/:id', deleteAPI);

module.exports = router;
