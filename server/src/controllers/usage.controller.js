const prisma = require('../config/database');
const { checkAndTriggerAlerts } = require('../services/notification.service');

async function trackUsage(req, res, next) {
  try {
    const { apiId, count } = req.validatedData;
    
    const api = await prisma.aPI.findFirst({
      where: { id: apiId, userId: req.user.id },
      include: { alerts: true },
    });
    
    if (!api) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found',
        },
      });
    }
    
    // Check if rate limit period has reset
    const now = new Date();
    const lastReset = new Date(api.lastReset);
    let shouldReset = false;
    
    switch (api.rateLimitPeriod) {
      case 'minute':
        shouldReset = now.getMinutes() !== lastReset.getMinutes() || 
                      now.getHours() !== lastReset.getHours() ||
                      now.getDate() !== lastReset.getDate();
        break;
      case 'hour':
        shouldReset = now.getHours() !== lastReset.getHours() ||
                      now.getDate() !== lastReset.getDate();
        break;
      case 'day':
        shouldReset = now.getDate() !== lastReset.getDate() ||
                      now.getMonth() !== lastReset.getMonth();
        break;
      case 'month':
        shouldReset = now.getMonth() !== lastReset.getMonth() ||
                      now.getFullYear() !== lastReset.getFullYear();
        break;
    }
    
    let newUsage;
    if (shouldReset) {
      newUsage = count;
      await prisma.aPI.update({
        where: { id: apiId },
        data: { currentUsage: count, lastReset: now },
      });
    } else {
      newUsage = api.currentUsage + count;
      await prisma.aPI.update({
        where: { id: apiId },
        data: { currentUsage: newUsage },
      });
    }
    
    // Record usage history
    const period = now.getHours() === 0 ? 'daily' : 'hourly';
    await prisma.usageHistory.create({
      data: {
        apiId,
        requestsCount: count,
        period,
      },
    });
    
    // Check alerts
    const percentage = (newUsage / api.rateLimit) * 100;
    await checkAndTriggerAlerts(api, percentage);
    
    res.json({
      success: true,
      data: {
        currentUsage: newUsage,
        rateLimit: api.rateLimit,
        percentage: Math.round(percentage * 10) / 10,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getUsageHistory(req, res, next) {
  try {
    const { apiId } = req.params;
    const { period, granularity } = req.validatedQuery;
    
    const api = await prisma.aPI.findFirst({
      where: { id: apiId, userId: req.user.id },
    });
    
    if (!api) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found',
        },
      });
    }
    
    const days = period === '30d' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const history = await prisma.usageHistory.findMany({
      where: {
        apiId,
        timestamp: { gte: startDate },
        period: granularity,
      },
      orderBy: { timestamp: 'asc' },
    });
    
    // Aggregate data by date
    const aggregated = history.reduce((acc, item) => {
      const date = item.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += item.requestsCount;
      return acc;
    }, {});
    
    const formattedHistory = Object.entries(aggregated).map(([date, count]) => ({
      date,
      requestsCount: count,
    }));
    
    res.json({
      success: true,
      data: formattedHistory,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { trackUsage, getUsageHistory };
