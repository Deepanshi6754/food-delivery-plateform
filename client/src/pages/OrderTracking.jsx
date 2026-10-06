// src/pages/OrderTracking.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../socket';
import { useSelector } from 'react-redux';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'In Kitchen', icon: '🍳' },
  { key: 'ready', label: 'Order Ready', icon: '📦' },
  { key: 'out_for_delivery', label: 'On The Way', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

const OrderTracking = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('placed');
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [liveNotification, setLiveNotification] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/orders/${id}`, { headers });
      setOrder(res.data);
      setStatus(res.data.orderStatus || 'placed');
    } catch (err) {
      console.error('Failed to fetch order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Socket.IO real-time subscription
    if (socket) {
      socket.emit('joinOrderRoom', id);

      const handleUpdate = (data) => {
        if (data.orderId === id) {
          setStatus(data.status);
          const formatted = data.status.replace(/_/g, ' ').toUpperCase();
          setLiveNotification(`⚡ Live Status Update: Your order is now ${formatted}!`);
          setTimeout(() => setLiveNotification(''), 6000);
        }
      };

      socket.on('orderStatusUpdate', handleUpdate);
      socket.on('orderStatusUpdated', handleUpdate);

      return () => {
        socket.emit('leaveOrderRoom', id);
        socket.off('orderStatusUpdate', handleUpdate);
        socket.off('orderStatusUpdated', handleUpdate);
      };
    }
  }, [id, token]);

  const handleAdvanceStatus = async () => {
    try {
      setAdvancing(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`/api/orders/${id}/advance`, {}, { headers });
      setOrder(res.data);
      setStatus(res.data.orderStatus);
    } catch (err) {
      console.error('Advance status failed', err);
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛵</div>
        <p>Connecting to live order feed...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Order #{id} not found</h2>
        <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === status);
  const progressPercent =
    currentStepIndex >= 0
      ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100
      : 0;

  return (
    <div className="order-tracking-page">
      <div className="tracking-card glassmorphism">
        <div className="tracking-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.8rem' }}>Live Order Tracking</h1>
              <span className={`status-badge ${status}`}>{status.replace('_', ' ')}</span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Order ID: <span style={{ fontFamily: 'monospace', color: '#fff' }}>{order._id}</span> • Restaurant:{' '}
              <strong style={{ color: '#fff' }}>{order.restaurant?.name || 'Partner Kitchen'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleAdvanceStatus}
              disabled={advancing || status === 'delivered'}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
              title="Click to simulate kitchen/rider progress in real time"
            >
              {advancing ? 'Updating...' : status === 'delivered' ? 'Completed' : 'Simulate Next Step ⏩'}
            </button>
            <Link to="/my-orders" className="btn-outline">
              My Orders
            </Link>
          </div>
        </div>

        {/* Real-time Status Alert Banner */}
        {liveNotification && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 18px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--secondary)',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'pulse 1.5s infinite',
            }}
          >
            <span>🟢</span>
            <span>{liveNotification}</span>
          </div>
        )}

        {/* Live Stepper Timeline */}
        <div className="stepper">
          <div className="stepper-progress" style={{ width: `${progressPercent}%` }} />
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || status === 'delivered';
            const isActive = idx === currentStepIndex && status !== 'delivered';

            return (
              <div
                key={step.key}
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="step-circle">{step.icon}</div>
                <div className="step-label">{step.label}</div>
              </div>
            );
          })}
        </div>

        {/* Simulated Live Delivery Map */}
        <div className="live-map-sim">
          <div className="map-grid-overlay" />
          <div className="driver-marker">🛵</div>
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(11, 14, 23, 0.85)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            🟢 Live GPS Signal Active • Estimated Delivery:{' '}
            <span style={{ color: 'var(--primary)' }}>
              {status === 'delivered' ? 'Arrived!' : '15-20 mins'}
            </span>
          </div>
        </div>

        {/* Driver Card */}
        <div className="driver-info-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              🧔
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>
                Vikram Singh <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>★ 4.9</span>
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Rider • Honda Activa 6G (DL 4S 8921)
              </p>
            </div>
          </div>

          <a
            href="tel:+919876533333"
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            📞 Call Rider
          </a>
        </div>

        {/* Delivered & Review Banner */}
        {status === 'delivered' && (
          <div
            style={{
              marginTop: '20px',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(224, 122, 60, 0.15))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--amber)', marginBottom: '4px' }}>
                🎉 Order Delivered! Enjoy your meal!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Help fellow foodies by sharing your feedback for {order.restaurant?.name || 'the kitchen'}.
              </p>
            </div>
            {order.restaurant && (
              <Link
                to={`/reviews/${order.restaurant._id || order.restaurant}`}
                className="btn-primary"
                style={{ background: 'var(--amber-gradient)', textDecoration: 'none', padding: '10px 20px', fontWeight: 700 }}
              >
                ★ Rate & Review Restaurant
              </Link>
            )}
          </div>
        )}

        {/* Order Details & Summary */}
        <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Items in Order</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span>
                    {item.name} <strong>x{item.quantity}</strong>
                  </span>
                  <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Delivery Destination</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              📍 {order.address}
            </p>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Payment Method:</span>
                <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary)' }}>₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
