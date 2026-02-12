const prisma = require('../config/database');
const { encrypt } = require('../services/encryption.service');
const { getForecast } = require('../services/forecast.service');

function getStatus(percentage) {
  if (percentage < 70) return 'safe';
  if (percentage < 90) return 'warning';
  return 'critical';
}

function getTimeUntilReset(lastReset, period) {
  const now = new Date();
  const resetDate = new Date(lastReset);
  
  switch (period) {
    case 'minute':
      resetDate.setMinutes(resetDate.getMinutes() + 1);
      break;
    case 'hour':
      resetDate.setHours(resetDate.getHours() + 1);
      break;
    case 'day':
      resetDate.setDate(resetDate.getDate() + 1);
      break;
    case 'month':
      resetDate.setMonth(resetDate.getMonth() + 1);
      break;
  }
  
  const diff = resetDate - now;
  if (diff <= 0) return 'Resetting...';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

async function getAllAPIs(req, res, next) {
  try {
    const apis = await prisma.aPI.findMany({
      where: { userId: req.user.id },
      include: {
        alerts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedAPIs = apis.map(api => {
      const percentage = (api.currentUsage / api.rateLimit) * 100;
      return {
        id: api.id,
        serviceName: api.serviceName,
        rateLimit: api.rateLimit,
        rateLimitPeriod: api.rateLimitPeriod,
        currentUsage: api.currentUsage,
        usagePercentage: Math.round(percentage * 10) / 10,
        status: getStatus(percentage),
        timeUntilReset: getTimeUntilReset(api.lastReset, api.rateLimitPeriod),
        lastReset: api.lastReset,
        createdAt: api.createdAt,
        alerts: api.alerts,
      };
    });
    
    res.json({
      success: true,
      data: formattedAPIs,
    });
  } catch (error) {
    next(error);
  }
}

async function getAPIById(req, res, next) {
  try {
    const { id } = req.params;
    
    const api = await prisma.aPI.findFirst({
      where: { id, userId: req.user.id },
      include: {
        alerts: true,
        usageHistory: {
          orderBy: { timestamp: 'desc' },
          take: 30,
        },
      },
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
    
    const percentage = (api.currentUsage / api.rateLimit) * 100;
    const forecast = await getForecast(api.id, api.currentUsage, api.rateLimit);
    
    res.json({
      success: true,
      data: {
        id: api.id,
        serviceName: api.serviceName,
        rateLimit: api.rateLimit,
        rateLimitPeriod: api.rateLimitPeriod,
        currentUsage: api.currentUsage,
        usagePercentage: Math.round(percentage * 10) / 10,
        status: getStatus(percentage),
        timeUntilReset: getTimeUntilReset(api.lastReset, api.rateLimitPeriod),
        lastReset: api.lastReset,
        createdAt: api.createdAt,
        alerts: api.alerts,
        usageHistory: api.usageHistory,
        forecast,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createAPI(req, res, next) {
  try {
    const { serviceName, apiKey, rateLimit, rateLimitPeriod } = req.validatedData;
    
    const apiKeyEncrypted = encrypt(apiKey);
    
    const api = await prisma.aPI.create({
      data: {
        userId: req.user.id,
        serviceName,
        apiKeyEncrypted,
        rateLimit,
        rateLimitPeriod,
      },
      select: {
        id: true,
        serviceName: true,
        rateLimit: true,
        rateLimitPeriod: true,
        currentUsage: true,
        lastReset: true,
        createdAt: true,
      },
    });
    
    res.status(201).json({
      success: true,
      data: api,
    });
  } catch (error) {
    next(error);
  }
}

async function updateAPI(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = { ...req.validatedData };
    
    if (updateData.apiKey) {
      updateData.apiKeyEncrypted = encrypt(updateData.apiKey);
      delete updateData.apiKey;
    }
    
    const api = await prisma.aPI.updateMany({
      where: { id, userId: req.user.id },
      data: updateData,
    });
    
    if (api.count === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found',
        },
      });
    }
    
    const updatedAPI = await prisma.aPI.findUnique({
      where: { id },
      select: {
        id: true,
        serviceName: true,
        rateLimit: true,
        rateLimitPeriod: true,
        currentUsage: true,
        lastReset: true,
        createdAt: true,
      },
    });
    
    res.json({
      success: true,
      data: updatedAPI,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAPI(req, res, next) {
  try {
    const { id } = req.params;
    
    const result = await prisma.aPI.deleteMany({
      where: { id, userId: req.user.id },
    });
    
    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found',
        },
      });
    }
    
    res.json({
      success: true,
      message: 'API deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllAPIs,
  getAPIById,
  createAPI,
  updateAPI,
  deleteAPI,
};
