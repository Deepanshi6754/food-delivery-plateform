// src/pages/DeliveryDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const DeliveryDashboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const ordersRes = await axios.get('/api/orders', { headers });
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Delivery data load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, [token]);

  const handleToggleOnline = async () => {
    try {
      setToggling(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post('/api/delivery/online', {}, { headers });
      setIsOnline(res.data.isOnline);
    } catch (err) {
      // Toggle locally if backend model differs
      setIsOnline((prev) => !prev);
    } finally {
      setToggling(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`/api/orders/${orderId}/status`, { status }, { headers });
      fetchDeliveryData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛵</div>
        <p>Connecting rider portal...</p>
      </div>
    );
  }

  return (
    <div className="delivery-dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '4px' }}>Rider Delivery Hub</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Rider: <strong>{user?.name || 'Vikram Singh'}</strong> • Vehicle: Honda Activa (DL 4S 8921)
          </p>
        </div>

        {/* Online Status Toggle */}
        <button
          onClick={handleToggleOnline}
          disabled={toggling}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            background: isOnline ? 'var(--secondary-gradient)' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            boxShadow: isOnline ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{isOnline ? '🟢' : '⚪'}</span>
          <span>{isOnline ? 'ONLINE & READY' : 'OFFLINE'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <span className="stat-label">Today's Earnings</span>
          <span className="stat-value" style={{ color: 'var(--secondary)' }}>
            ₹1,480
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed Deliveries</span>
          <span className="stat-value" style={{ color: 'var(--primary)' }}>
            14
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Customer Rating</span>
          <span className="stat-value" style={{ color: 'var(--amber)' }}>
            ★ 4.9
          </span>
        </div>
      </div>

      {/* Assigned Delivery Orders */}
      <div className="data-table-card glassmorphism">
        <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Assigned & Available Deliveries</h2>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛵</div>
            <p>No active delivery assignments right now. Stay online to receive trips!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((o) => (
              <div
                key={o._id}
                style={{
                  padding: '20px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.15rem' }}>{o.restaurant?.name || 'Restaurant'}</h3>
                    <span className={`status-badge ${o.orderStatus}`}>
                      {o.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Pickup: {o.restaurant?.address || 'Kitchen'} ➔ Drop: {o.address}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Order #{o._id.substring(o._id.length - 6)} • Total items:{' '}
                    {o.items?.reduce((acc, i) => acc + (i.quantity || 1), 0)} • ₹{o.total} ({o.paymentMethod.toUpperCase()})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {o.orderStatus !== 'out_for_delivery' && o.orderStatus !== 'delivered' && (
                    <button
                      onClick={() => handleUpdateStatus(o._id, 'out_for_delivery')}
                      className="btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                    >
                      Pick Up Order 🛵
                    </button>
                  )}
                  {o.orderStatus === 'out_for_delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(o._id, 'delivered')}
                      className="btn-primary"
                      style={{ background: 'var(--secondary-gradient)', padding: '8px 18px', fontSize: '0.85rem' }}
                    >
                      Complete Delivery 🎉
                    </button>
                  )}
                  <a
                    href={`/order/${o._id}`}
                    className="btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    View Map 🗺️
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
