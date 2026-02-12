import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '2px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#667eea',
    transition: 'all 0.2s',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  addBtn: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '28px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  apiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
  },
  apiCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  apiName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: '10px',
  },
  deleteBtn: {
    padding: '6px 10px',
    backgroundColor: '#fee2e2',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
  },
  statusBadge: (status) => ({
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: status === 'critical' ? '#fee2e2' : status === 'warning' ? '#fef3c7' : '#d1fae5',
    color: status === 'critical' ? '#dc2626' : status === 'warning' ? '#d97706' : '#059669',
  }),
  usageInfo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '12px',
  },
  usageNumbers: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
  },
  usagePeriod: {
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  usageBar: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e5e7eb',
    borderRadius: '5px',
    overflow: 'hidden',
    marginTop: '12px',
  },
  usageFill: (percentage, status) => ({
    height: '100%',
    width: `${Math.min(percentage, 100)}%`,
    backgroundColor: status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981',
    transition: 'width 0.5s ease-out',
    borderRadius: '5px',
  }),
  usageDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '12px',
    fontSize: '14px',
  },
  percentage: {
    fontWeight: '600',
    color: '#374151',
  },
  resetTime: {
    color: '#6b7280',
  },
  cardActions: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6',
  },
  trackBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '32px',
    width: '90%',
    maxWidth: '480px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '20px',
    backgroundColor: 'white',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'background-color 0.2s',
  },
  saveBtn: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'transform 0.1s, box-shadow 0.2s',
  },
};

function DashboardSimple() {
  const navigate = useNavigate();
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    apiKey: '',
    rateLimit: '',
    rateLimitPeriod: 'day',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAPIs();
  }, []);

  const fetchAPIs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/apis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setApis(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch APIs:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const trackUsage = async (apiId) => {
    try {
      await axios.post(
        `${API_URL}/api/usage/track`,
        { apiId, usageCount: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAPIs(); // Refresh to show updated usage
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to track usage');
    }
  };

  const deleteAPI = async (apiId, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceName}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      await axios.delete(
        `${API_URL}/api/apis/${apiId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAPIs(); // Refresh to show updated list
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete API');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/apis`,
        {
          ...formData,
          rateLimit: parseInt(formData.rateLimit),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setFormData({ serviceName: '', apiKey: '', rateLimit: '', rateLimitPeriod: 'day' });
      fetchAPIs();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to add API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>API Rate Limit Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <main style={styles.main}>
        <button onClick={() => setShowModal(true)} style={styles.addBtn}>
          + Add API
        </button>

        <div style={styles.apiGrid}>
          {apis.map((api) => (
            <div key={api.id} style={styles.apiCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.apiName}>{api.serviceName}</h3>
                <button
                  onClick={() => deleteAPI(api.id, api.serviceName)}
                  style={styles.deleteBtn}
                  title="Delete API"
                >
                  🗑️
                </button>
              </div>
              
              <div style={styles.statusBadge(api.status)}>
                {api.status === 'critical' ? '🔴 Critical' : api.status === 'warning' ? '🟠 Warning' : '🟢 Safe'}
              </div>
              
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px', marginTop: '10px' }}>
                API ID: <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{api.id}</code>
              </p>
              
              <div style={styles.usageInfo}>
                <span style={styles.usageNumbers}>
                  {api.currentUsage.toLocaleString()} / {api.rateLimit.toLocaleString()}
                </span>
                <span style={styles.usagePeriod}>{api.rateLimitPeriod}</span>
              </div>
              
              <div style={styles.usageBar}>
                <div style={styles.usageFill(api.usagePercentage, api.status)} />
              </div>
              
              <div style={styles.usageDetails}>
                <span style={styles.percentage}>{api.usagePercentage}% used</span>
                <span style={styles.resetTime}>Resets in {api.timeUntilReset}</span>
              </div>
              
              <div style={styles.cardActions}>
                <button
                  onClick={() => trackUsage(api.id)}
                  style={styles.trackBtn}
                >
                  + Track 1 Call
                </button>
              </div>
            </div>
          ))}
        </div>

        {apis.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '16px', marginTop: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              No APIs Added Yet
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Start tracking your API usage by adding your first API key
            </p>
            <button 
              onClick={() => setShowModal(true)} 
              style={{...styles.addBtn, marginBottom: 0}}
            >
              + Add Your First API
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              ➕ Add New API
            </h2>
            <p style={{ marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
              Track your API usage and get alerts when approaching limits
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Service Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., OpenAI, Google Gemini, Stripe"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  API Key *
                </label>
                <input
                  type="password"
                  placeholder="Enter your API key"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  style={styles.input}
                  required
                />
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  🔒 Your API key is encrypted and stored securely
                </p>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Rate Limit *
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.rateLimit}
                  onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Rate Limit Period *
                </label>
                <select
                  value={formData.rateLimitPeriod}
                  onChange={(e) => setFormData({ ...formData, rateLimitPeriod: e.target.value })}
                  style={styles.select}
                >
                  <option value="minute">Per Minute</option>
                  <option value="hour">Per Hour</option>
                  <option value="day">Per Day</option>
                  <option value="month">Per Month</option>
                </select>
              </div>
              
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn} disabled={loading}>
                  {loading ? '⏳ Adding...' : '✓ Add API'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardSimple;
