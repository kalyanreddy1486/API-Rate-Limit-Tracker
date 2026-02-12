const prisma = require('../config/database');

// In-memory store for notifications (will be sent to connected clients)
const pendingNotifications = new Map();

async function checkAndTriggerAlerts(api, currentPercentage) {
  try {
    const activeAlerts = api.alerts.filter(alert => alert.isActive);
    
    for (const alert of activeAlerts) {
      // Check if threshold is breached
      if (currentPercentage >= alert.thresholdPercentage) {
        // Check if we've already triggered this alert recently (within 1 hour)
        const lastTriggered = alert.lastTriggered;
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        if (!lastTriggered || lastTriggered < oneHourAgo) {
          // Trigger the alert
          await triggerAlert(api, alert, currentPercentage);
          
          // Update last triggered time
          await prisma.alert.update({
            where: { id: alert.id },
            data: { lastTriggered: new Date() },
          });
        }
      }
    }
  } catch (error) {
    console.error('Alert checking error:', error);
  }
}

async function triggerAlert(api, alert, currentPercentage) {
  const notification = {
    id: generateNotificationId(),
    type: 'alert',
    title: `Rate Limit Alert: ${api.serviceName}`,
    message: `Usage has reached ${Math.round(currentPercentage)}% of your ${alert.thresholdPercentage}% threshold`,
    apiId: api.id,
    serviceName: api.serviceName,
    thresholdPercentage: alert.thresholdPercentage,
    currentPercentage: Math.round(currentPercentage),
    timestamp: new Date(),
    read: false,
  };
  
  // Store notification for the user
  if (!pendingNotifications.has(api.userId)) {
    pendingNotifications.set(api.userId, []);
  }
  pendingNotifications.get(api.userId).push(notification);
  
  // Log the alert (in production, this could send email, push notification, etc.)
  console.log(`ALERT triggered for user ${api.userId}:`, notification);
}

function generateNotificationId() {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getNotifications(userId) {
  return pendingNotifications.get(userId) || [];
}

function clearNotifications(userId) {
  pendingNotifications.delete(userId);
}

function markNotificationAsRead(userId, notificationId) {
  const notifications = pendingNotifications.get(userId);
  if (notifications) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }
}

module.exports = {
  checkAndTriggerAlerts,
  getNotifications,
  clearNotifications,
  markNotificationAsRead,
};
