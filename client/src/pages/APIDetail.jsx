import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import UsageLineChart from '../components/charts/UsageLineChart';
import useAPIStore from '../store/apiStore';
import useAuthStore from '../store/authStore';
import usageService from '../services/usage.service';

function APIDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { selectedAPI, loading, fetchAPIById } = useAPIStore();
  
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchAPIById(id);
  }, [id, fetchAPIById]);

  useEffect(() => {
    if (selectedAPI) {
      fetchHistory();
    }
  }, [selectedAPI, period]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await usageService.getHistory(id, { period, granularity: 'daily' });
      const historyData = response.data || response;
      setHistory(historyData);
    } catch (error) {
      toast.error('Failed to fetch usage history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading || !selectedAPI) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  const {
    serviceName,
    currentUsage,
    rateLimit,
    usagePercentage,
    status,
    timeUntilReset,
    rateLimitPeriod,
    forecast,
  } = selectedAPI;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{serviceName}</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(status)}`} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
                <p className="text-gray-600 capitalize">{status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{usagePercentage}%</p>
              <p className="text-gray-600">{currentUsage.toLocaleString()} / {rateLimit.toLocaleString()} {rateLimitPeriod}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getStatusColor(status)}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Resets in: <strong>{timeUntilReset}</strong></span>
          </div>
        </Card>

        {/* Forecast Card */}
        {forecast && (
          <Card className="mb-6" header={<h3 className="text-lg font-semibold">Usage Forecast</h3>}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Estimated Time to Limit</p>
                <p className="text-xl font-semibold text-gray-900">
                  {forecast.estimatedTimeToLimit || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Usage/Hour</p>
                <p className="text-xl font-semibold text-gray-900">
                  {forecast.averageUsagePerHour !== null ? forecast.averageUsagePerHour.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recommendation</p>
                <p className="text-sm font-medium text-gray-900">{forecast.recommendation || 'N/A'}</p>
              </div>
            </div>
            {forecast.message && (
              <p className="mt-4 text-sm text-gray-500">{forecast.message}</p>
            )}
          </Card>
        )}

        {/* Usage History Chart */}
        <Card 
          className="mb-6"
          header={
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Usage History</h3>
              <div className="flex gap-2">
                <Button
                  variant={period === '7d' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPeriod('7d')}
                >
                  7 Days
                </Button>
                <Button
                  variant={period === '30d' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPeriod('30d')}
                >
                  30 Days
                </Button>
              </div>
            </div>
          }
        >
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No usage history available yet
            </div>
          ) : (
            <UsageLineChart data={history} period={period} />
          )}
        </Card>
      </main>
    </div>
  );
}

export default APIDetail;
