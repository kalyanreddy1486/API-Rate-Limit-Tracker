const z = require('zod');

const trackUsageSchema = z.object({
  apiId: z.string().uuid('Invalid API ID'),
  count: z.number().int().positive().default(1),
});

const getUsageHistorySchema = z.object({
  period: z.enum(['7d', '30d']).default('7d'),
  granularity: z.enum(['hourly', 'daily']).default('daily'),
});

module.exports = { trackUsageSchema, getUsageHistorySchema };
