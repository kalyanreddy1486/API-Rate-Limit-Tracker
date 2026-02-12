import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import APICard from '../components/dashboard/APICard';
import DashboardStats from '../components/dashboard/DashboardStats';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import useAuthStore from '../store/authStore';
import useAPIStore from '../store/apiStore';
import { useForm } from 'react-hook-form';

function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { apis, loading, error, fetchAPIs, addAPI, deleteAPI, clearError } = useAPIStore();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchAPIs();
    const interval = setInterval(fetchAPIs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchAPIs]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onAddSubmit = async (data) => {
    const result = await addAPI({
      ...data,
      rateLimit: parseInt(data.rateLimit),
    });
    if (result.success) {
      toast.success('API added successfully');
      setIsAddModalOpen(false);
      reset();
    } else {
      toast.error(result.error || 'Failed to add API');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API?')) return;
    
    setIsDeleting(true);
    const result = await deleteAPI(id);
    setIsDeleting(false);
    
    if (result.success) {
      toast.success('API deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete API');
    }
  };

  const handleEdit = (api) => {
    // Navigate to detail page or open edit modal
    navigate(`/api/${api.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">API Rate Limit Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <DashboardStats apis={apis} />

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your APIs</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add API
          </Button>
        </div>

        {/* API Grid */}
        {loading && apis.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : apis.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No APIs</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first API.</p>
            <div className="mt-6">
              <Button onClick={() => setIsAddModalOpen(true)}>Add API</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apis.map((api) => (
              <APICard
                key={api.id}
                api={api}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add API Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New API"
      >
        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
          <Input
            label="Service Name"
            placeholder="e.g., OpenAI, GitHub, Stripe"
            error={errors.serviceName?.message}
            {...register('serviceName', { required: 'Service name is required' })}
          />

          <Input
            label="API Key"
            type="password"
            placeholder="Enter your API key"
            error={errors.apiKey?.message}
            {...register('apiKey', { required: 'API key is required' })}
          />

          <Input
            label="Rate Limit"
            type="number"
            placeholder="e.g., 1000"
            error={errors.rateLimit?.message}
            {...register('rateLimit', {
              required: 'Rate limit is required',
              min: { value: 1, message: 'Rate limit must be at least 1' },
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate Limit Period
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register('rateLimitPeriod', { required: true })}
            >
              <option value="minute">Per Minute</option>
              <option value="hour">Per Hour</option>
              <option value="day">Per Day</option>
              <option value="month">Per Month</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add API
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Dashboard;
