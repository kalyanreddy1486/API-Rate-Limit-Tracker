const prisma = require('../config/database');

async function getForecast(apiId, currentUsage, rateLimit) {
  try {
    // Get usage history for the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const history = await prisma.usageHistory.findMany({
      where: {
        apiId,
        timestamp: { gte: twentyFourHoursAgo },
      },
      orderBy: { timestamp: 'desc' },
    });
    
    if (history.length === 0) {
      return {
        estimatedTimeToLimit: null,
        averageUsagePerHour: null,
        message: 'Insufficient data for forecast',
      };
    }
    
    // Calculate average usage per hour
    const totalRequests = history.reduce((sum, item) => sum + item.requestsCount, 0);
    const hoursOfData = Math.max(1, (new Date() - history[history.length - 1].timestamp) / (1000 * 60 * 60));
    const averageUsagePerHour = Math.round(totalRequests / hoursOfData);
    
    if (averageUsagePerHour === 0) {
      return {
        estimatedTimeToLimit: null,
        averageUsagePerHour: 0,
        message: 'No significant usage detected',
      };
    }
    
    // Calculate remaining requests
    const remainingRequests = rateLimit - currentUsage;
    
    if (remainingRequests <= 0) {
      return {
        estimatedTimeToLimit: 'Limit reached',
        averageUsagePerHour,
        message: 'Rate limit already reached',
      };
    }
    
    // Estimate time until limit
    const hoursUntilLimit = remainingRequests / averageUsagePerHour;
    
    let estimatedTimeToLimit;
    if (hoursUntilLimit < 1) {
      const minutes = Math.round(hoursUntilLimit * 60);
      estimatedTimeToLimit = `${minutes} minutes`;
    } else if (hoursUntilLimit < 24) {
      const hours = Math.floor(hoursUntilLimit);
      const minutes = Math.round((hoursUntilLimit - hours) * 60);
      estimatedTimeToLimit = minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
    } else {
      const days = Math.floor(hoursUntilLimit / 24);
      const hours = Math.floor(hoursUntilLimit % 24);
      estimatedTimeToLimit = hours > 0 ? `${days}d ${hours}h` : `${days} days`;
    }
    
    // Generate recommendation
    let recommendation;
    const percentage = (currentUsage / rateLimit) * 100;
    
    if (percentage >= 90) {
      recommendation = 'URGENT: Slow down API usage immediately or upgrade your plan';
    } else if (percentage >= 80) {
      recommendation = 'WARNING: Consider reducing API calls or upgrading plan soon';
    } else if (hoursUntilLimit < 12) {
      recommendation = 'Monitor usage closely - limit approaching within 12 hours';
    } else {
      recommendation = 'Usage on track - no action needed';
    }
    
    return {
      estimatedTimeToLimit,
      averageUsagePerHour,
      message: null,
      recommendation,
    };
  } catch (error) {
    console.error('Forecast error:', error);
    return {
      estimatedTimeToLimit: null,
      averageUsagePerHour: null,
      message: 'Unable to generate forecast',
    };
  }
}

module.exports = { getForecast };
