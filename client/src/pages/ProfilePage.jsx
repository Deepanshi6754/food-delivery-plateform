// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateUser } from '../store/authSlice';
import axios from 'axios';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, role, token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFormName(user?.name || '');
    setFormPhone(user?.phone || '');
    setFormAddress(user?.addresses?.[0]?.street || '');

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/orders/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, token, navigate, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage('');
      const res = await axios.put(
        '/api/users/profile',
        { name: formName, phone: formPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateUser(res.data));
      setEditMode(false);
      setStatusMessage('Profile updated successfully!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setStatusMessage('Failed to update profile. ' + (err.response?.data?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  // Stats
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrders = orders.filter(
    (o) => !['delivered', 'cancelled'].includes(o.orderStatus)
  ).length;

  const roleInfo = {
    customer: { label: 'Customer', icon: '👤', color: 'var(--secondary)' },
    owner: { label: 'Restaurant Owner', icon: '🍳', color: 'var(--amber)' },
    delivery: { label: 'Delivery Rider', icon: '🛵', color: 'var(--blue)' },
    admin: { label: 'System Admin', icon: '⚡', color: 'var(--rose)' },
  };
  const currentRole = roleInfo[role] || roleInfo.customer;

  return (
    <div className="profile-page">
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="profile-hero-info">
            <h1>{user?.name || 'Food Enthusiast'}</h1>
            <div className="profile-meta-row">
              <span
                className="profile-role-badge"
                style={{ background: `${currentRole.color}22`, color: currentRole.color }}
              >
                {currentRole.icon} {currentRole.label}
              </span>
              <span className="profile-email">📧 {user?.email || 'user@food.com'}</span>
              {user?.phone && <span className="profile-phone">📱 {user.phone}</span>}
            </div>
            <p className="profile-since">
              Member since{' '}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Recently'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className="profile-status-msg"
          style={{
            background: statusMessage.startsWith('Failed')
              ? 'rgba(232,85,85,0.12)'
              : 'rgba(39,174,120,0.12)',
            color: statusMessage.startsWith('Failed') ? 'var(--rose)' : 'var(--secondary)',
            border: statusMessage.startsWith('Failed')
              ? '1px solid rgba(232,85,85,0.25)'
              : '1px solid rgba(39,174,120,0.25)',
          }}
        >
          {statusMessage.startsWith('Failed') ? '❌' : '✅'} {statusMessage}
        </div>
      )}

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-icon" style={{ background: 'rgba(224,122,60,0.12)' }}>
            📦
          </div>
          <div className="profile-stat-info">
            <span className="profile-stat-value" style={{ color: 'var(--primary)' }}>
              {totalOrders}
            </span>
            <span className="profile-stat-label">Total Orders</span>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon" style={{ background: 'rgba(39,174,120,0.12)' }}>
            ✅
          </div>
          <div className="profile-stat-info">
            <span className="profile-stat-value" style={{ color: 'var(--secondary)' }}>
              {deliveredOrders}
            </span>
            <span className="profile-stat-label">Delivered</span>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon" style={{ background: 'rgba(240,160,48,0.12)' }}>
            💰
          </div>
          <div className="profile-stat-info">
            <span className="profile-stat-value" style={{ color: 'var(--amber)' }}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </span>
            <span className="profile-stat-label">Total Spent</span>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon" style={{ background: 'rgba(90,103,216,0.12)' }}>
            🔄
          </div>
          <div className="profile-stat-info">
            <span className="profile-stat-value" style={{ color: 'var(--indigo)' }}>
              {activeOrders}
            </span>
            <span className="profile-stat-label">Active Now</span>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Account Details Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Account Details</h2>
            {!editMode ? (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                onClick={() => setEditMode(true)}
              >
                ✏️ Edit
              </button>
            ) : (
              <button
                type="button"
                className="btn-small"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSave} className="profile-edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="form-group">
                <label>Default Address</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Your delivery address"
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="profile-details-list">
              <div className="profile-detail-row">
                <span className="profile-detail-label">Name</span>
                <span className="profile-detail-value">{user?.name || '—'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Email</span>
                <span className="profile-detail-value">{user?.email || '—'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Phone</span>
                <span className="profile-detail-value">{user?.phone || 'Not set'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Role</span>
                <span className="profile-detail-value" style={{ color: currentRole.color }}>
                  {currentRole.icon} {currentRole.label}
                </span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Default Address</span>
                <span className="profile-detail-value">
                  {user?.addresses?.[0]?.street || 'Flat 402, Lotus Boulevard, Sector 100, Noida'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="profile-card">
          <h2 style={{ marginBottom: '20px' }}>Quick Actions</h2>
          <div className="profile-actions-grid">
            <Link to="/my-orders" className="profile-action-btn">
              <span className="profile-action-icon">📦</span>
              <span>My Orders</span>
            </Link>
            <Link to="/cart" className="profile-action-btn">
              <span className="profile-action-icon">🛒</span>
              <span>View Cart</span>
            </Link>
            <Link to="/" className="profile-action-btn">
              <span className="profile-action-icon">🍽️</span>
              <span>Explore Restaurants</span>
            </Link>
            <Link to="/menu" className="profile-action-btn">
              <span className="profile-action-icon">☕</span>
              <span>Coffee Menu</span>
            </Link>

            {(role === 'owner' || role === 'admin') && (
              <Link to="/owner" className="profile-action-btn">
                <span className="profile-action-icon">🍳</span>
                <span>Kitchen Portal</span>
              </Link>
            )}
            {(role === 'delivery' || role === 'admin') && (
              <Link to="/delivery" className="profile-action-btn">
                <span className="profile-action-icon">🛵</span>
                <span>Rider Hub</span>
              </Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="profile-action-btn">
                <span className="profile-action-icon">⚙️</span>
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          <button
            type="button"
            className="profile-logout-btn"
            onClick={handleLogout}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="profile-card" style={{ marginTop: '24px' }}>
        <div className="profile-card-header">
          <h2>Recent Orders</h2>
          <Link to="/my-orders" className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>
            Loading order history...
          </p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🍽️</div>
            <p>No orders placed yet. Start exploring!</p>
          </div>
        ) : (
          <div className="profile-recent-orders">
            {orders.slice(0, 5).map((order) => (
              <Link
                to={`/order/${order._id}`}
                key={order._id}
                className="profile-order-row"
              >
                <div className="profile-order-info">
                  <span className="profile-order-restaurant">
                    {order.restaurant?.name || 'Partner Kitchen'}
                  </span>
                  <span className="profile-order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="profile-order-meta">
                  <span className={`status-badge ${order.orderStatus}`}>
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                  <span className="profile-order-total">₹{order.total}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
