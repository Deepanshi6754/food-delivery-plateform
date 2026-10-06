// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, ordersRes, restRes] = await Promise.all([
        axios.get('/api/admin/stats', { headers }),
        axios.get('/api/orders', { headers }),
        axios.get('/api/restaurants'),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setRestaurants(restRes.data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      setSeedMessage('');
      const res = await axios.get('/api/seed');
      setSeedMessage(res.data.message || 'Database successfully seeded!');
      fetchData();
    } catch (err) {
      setSeedMessage('Failed to seed database: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
        <p>Loading platform analytics and metrics...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '4px' }}>Admin Overview</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Real-time platform metrics, transactions, and kitchen operations
          </p>
        </div>

        <button
          onClick={handleSeedDatabase}
          disabled={seeding}
          className="btn-primary"
          style={{ background: 'var(--amber-gradient)' }}
        >
          {seeding ? 'Seeding...' : '⚡ Re-Seed Sample Database'}
        </button>
      </div>

      {seedMessage && (
        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--secondary)',
            marginBottom: '24px',
            fontWeight: 600,
          }}
        >
          ✅ {seedMessage}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Platform Revenue</span>
          <span className="stat-value" style={{ color: 'var(--secondary)' }}>
            ₹{stats?.totalRevenue || 0}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Orders Placed</span>
          <span className="stat-value" style={{ color: 'var(--primary)' }}>
            {stats?.totalOrders || orders.length}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Registered Users</span>
          <span className="stat-value" style={{ color: 'var(--indigo)' }}>
            {stats?.totalUsers || 4}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Partner Restaurants</span>
          <span className="stat-value" style={{ color: 'var(--amber)' }}>
            {stats?.totalRestaurants || restaurants.length}
          </span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="data-table-card glassmorphism" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Recent Orders Across Platform</h2>
        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No orders registered yet.</p>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {o._id.substring(o._id.length - 8)}
                  </td>
                  <td>{o.customer?.name || 'Customer'}</td>
                  <td>{o.restaurant?.name || 'Kitchen'}</td>
                  <td style={{ fontWeight: 700 }}>₹{o.total}</td>
                  <td>
                    <span className={`status-badge ${o.orderStatus}`}>
                      {o.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        color: o.paymentStatus === 'paid' ? 'var(--secondary)' : 'var(--amber)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                      }}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Active Restaurants List */}
      <div className="data-table-card glassmorphism">
        <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Active Restaurants ({restaurants.length})</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Restaurant Name</th>
              <th>Address</th>
              <th>Rating</th>
              <th>Delivery Time</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r._id}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td style={{ color: 'var(--text-dim)' }}>{r.address}</td>
                <td>
                  <span className="rating-badge">★ {r.rating?.toFixed(1) || '4.5'}</span>
                </td>
                <td>{r.deliveryTime || '25-35 mins'}</td>
                <td>₹{r.deliveryFee || 40}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
