const prisma = require('../config/database');

async function getAlerts(req, res, next) {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id },
      include: {
        api: {
          select: {
            serviceName: true,
            currentUsage: true,
            rateLimit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      apiId: alert.apiId,
      serviceName: alert.api.serviceName,
      thresholdPercentage: alert.thresholdPercentage,
      isActive: alert.isActive,
      lastTriggered: alert.lastTriggered,
      currentUsage: alert.api.currentUsage,
      rateLimit: alert.api.rateLimit,
      createdAt: alert.createdAt,
    }));
    
    res.json({
      success: true,
      data: formattedAlerts,
    });
  } catch (error) {
    next(error);
  }
}

async function createAlert(req, res, next) {
  try {
    const { apiId, thresholdPercentage } = req.validatedData;
    
    // Verify API belongs to user
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
    
    const alert = await prisma.alert.create({
      data: {
        userId: req.user.id,
        apiId,
        thresholdPercentage,
      },
      include: {
        api: {
          select: { serviceName: true },
        },
      },
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: alert.id,
        apiId: alert.apiId,
        serviceName: alert.api.serviceName,
        thresholdPercentage: alert.thresholdPercentage,
        isActive: alert.isActive,
        createdAt: alert.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateAlert(req, res, next) {
  try {
    const { id } = req.params;
    
    const alert = await prisma.alert.updateMany({
      where: { id, userId: req.user.id },
      data: req.validatedData,
    });
    
    if (alert.count === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Alert not found',
        },
      });
    }
    
    const updatedAlert = await prisma.alert.findUnique({
      where: { id },
      include: {
        api: {
          select: { serviceName: true },
        },
      },
    });
    
    res.json({
      success: true,
      data: {
        id: updatedAlert.id,
        apiId: updatedAlert.apiId,
        serviceName: updatedAlert.api.serviceName,
        thresholdPercentage: updatedAlert.thresholdPercentage,
        isActive: updatedAlert.isActive,
        lastTriggered: updatedAlert.lastTriggered,
        createdAt: updatedAlert.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAlert(req, res, next) {
  try {
    const { id } = req.params;
    
    const result = await prisma.alert.deleteMany({
      where: { id, userId: req.user.id },
    });
    
    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Alert not found',
        },
      });
    }
    
    res.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
};
