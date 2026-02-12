const z = require('zod');

const createAlertSchema = z.object({
  apiId: z.string().uuid('Invalid API ID'),
  thresholdPercentage: z.number().int().min(50).max(99),
});

const updateAlertSchema = z.object({
  thresholdPercentage: z.number().int().min(50).max(99).optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

module.exports = { createAlertSchema, updateAlertSchema };
