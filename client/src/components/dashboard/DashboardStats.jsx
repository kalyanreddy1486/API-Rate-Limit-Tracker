import React from 'react';
import Card from '../common/Card';

function DashboardStats({ apis }) {
  const totalAPIs = apis.length;
  const criticalAPIs = apis.filter(api => api.status === 'critical').length;
  const warningAPIs = apis.filter(api => api.status === 'warning').length;
  const mostUsed = apis.length > 0 
    ? apis.reduce((max, api) => api.usagePercentage > max.usagePercentage ? api : max, apis[0])
    : null;

  const stats = [
    {
      title: 'Total APIs',
      value: totalAPIs,
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
      color: 'bg-blue-50',
    },
    {
      title: 'Critical Alerts',
      value: criticalAPIs,
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'bg-red-50',
    },
    {
      title: 'Warnings',
      value: warningAPIs,
      icon: (
        <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-50',
    },
    {
      title: 'Most Used API',
      value: mostUsed ? mostUsed.serviceName : '-',
      subValue: mostUsed ? `${mostUsed.usagePercentage}%` : '',
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} padding={true} className="h-full">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
                {stat.subValue && (
                  <span className="text-sm font-normal text-gray-500 ml-1">({stat.subValue})</span>
                )}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStats;
