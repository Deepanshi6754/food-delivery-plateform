// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { login } from '../store/authSlice';

const DEMO_ACCOUNTS = [
  { role: 'customer', label: '👤 Customer', email: 'customer@food.com', pass: 'password123' },
  { role: 'owner', label: '🍳 Restaurant Owner', email: 'owner@food.com', pass: 'password123' },
  { role: 'delivery', label: '🛵 Delivery Rider', email: 'delivery@food.com', pass: 'password123' },
  { role: 'admin', label: '⚡ System Admin', email: 'admin@food.com', pass: 'password123' },
];

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      dispatch(login({ token: res.data.token, user: res.data.user, role: res.data.user.role }));
      
      // Redirect based on role
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'owner') navigate('/owner');
      else if (role === 'delivery') navigate('/delivery');
      else navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demo) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    // Directly submit with demo credentials
    axios.post('/api/auth/login', { email: demo.email, password: demo.pass })
      .then((res) => {
        dispatch(login({ token: res.data.token, user: res.data.user, role: res.data.user.role }));
        const role = res.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'owner') navigate('/owner');
        else if (role === 'delivery') navigate('/delivery');
        else navigate('/');
      })
      .catch((err) => {
        setError('Demo login failed. Make sure database is seeded.');
      });
  };

  return (
    <div className="auth-wrapper glassmorphism">
      <div className="auth-header">
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍔</div>
        <h2>Welcome Back</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Sign in to access your orders, saved addresses, and privileges
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '12px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--rose)',
            fontSize: '0.88rem',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', marginTop: '10px', padding: '12px' }}
        >
          {loading ? 'Signing In...' : 'Sign In ➔'}
        </button>
      </form>

      {/* 1-Click Demo Accounts */}
      <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '8px' }}>
          ONE-CLICK DEMO LOGIN (TESTING):
        </p>
        <div className="demo-account-pills">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              className="demo-pill"
              onClick={() => handleDemoClick(acc)}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Create one now
        </Link>
      </div>
    </div>
  );
};

export default Login;
