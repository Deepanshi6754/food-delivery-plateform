// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { login } from '../store/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role,
        phone,
      });

      dispatch(login({ token: res.data.token, user: res.data.user, role: res.data.user.role }));
      if (role === 'owner') navigate('/owner');
      else if (role === 'delivery') navigate('/delivery');
      else navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper glassmorphism">
      <div className="auth-header">
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✨</div>
        <h2>Create an Account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Join FoodDelight to order gourmet meals or partner with us
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
          <label>Full Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

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
            placeholder="Min. 6 characters"
            required
          />
        </div>

        <div className="form-group">
          <label>Account Type / Role</label>
          <select
            className="form-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer">Customer (Order Food)</option>
            <option value="owner">Restaurant Owner (List Menu & Manage Orders)</option>
            <option value="delivery">Delivery Partner (Deliver Orders)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', marginTop: '10px', padding: '12px' }}
        >
          {loading ? 'Creating Account...' : 'Get Started ➔'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Already registered?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Log in here
        </Link>
      </div>
    </div>
  );
};

export default Register;
