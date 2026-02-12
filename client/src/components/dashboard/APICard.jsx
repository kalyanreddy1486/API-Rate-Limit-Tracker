import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const statusColors = {
  safe: 'bg-green-500',
  warning: 'bg-yellow-500',
  critical: 'bg-red-500',
};

const statusTextColors = {
  safe: 'text-green-500',
  warning: 'text-yellow-500',
  critical: 'text-red-500',
};

const periodLabels = {
  minute: 'per minute',
  hour: 'per hour',
  day: 'per day',
  month: 'per month',
};

function APICard({ api, onEdit, onDelete }) {
  const { 
    serviceName, 
    currentUsage, 
    rateLimit, 
    usagePercentage, 
    status, 
    timeUntilReset,
    rateLimitPeriod 
  } = api;

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{serviceName}</h3>
          <p className="text-sm text-gray-500">{periodLabels[rateLimitPeriod]}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Usage</span>
          <span className={`text-sm font-semibold ${statusTextColors[status]}`}>
            {usagePercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${statusColors[status]}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-gray-600">{currentUsage.toLocaleString()} / {rateLimit.toLocaleString()}</span>
          <span className="text-gray-500">Resets in {timeUntilReset}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(api)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" className="flex-1" onClick={() => onDelete(api.id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}

export default APICard;
