// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>🍔 FoodDelight</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Fastest gourmet food delivery to your doorstep. Handcrafted flavors, real-time tracking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/my-orders">Track Orders</Link>
          <Link to="/admin">Admin</Link>
        </div>
        <div>
          <p>© {new Date().getFullYear()} FoodDelight Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



