// src/pages/MyOrders.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const MyOrders = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/orders/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch user orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [isAuthenticated, token, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📦</div>
        <p>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem' }}>My Orders ({orders.length})</h1>
        <Link to="/" className="btn-primary" style={{ padding: '8px 20px' }}>
          Order More Food
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="glassmorphism" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '14px' }}>🍽️</div>
          <h2>No orders placed yet</h2>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0 24px' }}>
            When you order your favorite gourmet meals, they will appear here for live tracking.
          </p>
          <Link to="/" className="btn-primary">
            Explore Menu
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} className="glassmorphism" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                    {order.restaurant?.name || 'Partner Kitchen'}
                  </h3>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    Order #{order._id} • {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className={`status-badge ${order.orderStatus}`}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                  <Link to={`/order/${order._id}`} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    Track Live ➔
                  </Link>
                  {order.restaurant && (
                    <Link
                      to={`/reviews/${order.restaurant._id || order.restaurant}`}
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      ★ Review
                    </Link>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {order.items?.map((item) => `${item.name} (x${item.quantity})`).join(', ')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  Total: <span style={{ color: 'var(--primary)' }}>₹{order.total}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
