// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useCart } from '../hooks/useCart';

const Sidebar = ({ onOpenDonation, mobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, role } = useSelector((state) => state.auth);
  const { itemCount } = useCart();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { label: 'Explore Food', path: '/', icon: '🍽️', exact: true },
    { label: 'Food Menu', path: '/menu', icon: '📋', isMenu: true },
    { label: 'My Orders', path: '/my-orders', icon: '🛒', badge: itemCount > 0 ? itemCount : null },
    { label: 'Order History', path: '/my-orders?tab=history', icon: '🕒' },
    ...(isAuthenticated ? [{ label: 'My Profile', path: '/profile', icon: '👤' }] : []),
    ...(role === 'delivery' || role === 'admin'
      ? [{ label: 'Rider Hub', path: '/delivery', icon: '🛵' }]
      : []),
    ...(role === 'owner' || role === 'admin'
      ? [{ label: 'Kitchen Portal', path: '/owner', icon: '🍳' }]
      : [{ label: 'Partner with Us', path: isAuthenticated ? '/owner' : '/login', icon: '👥' }]),
    ...(role === 'admin'
      ? [{ label: 'Admin Hub', path: '/admin', icon: '⚙️' }]
      : []),
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`purr-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand / Logo */}
        <div className="purr-logo-container">
          <NavLink to="/" className="purr-logo" onClick={onCloseMobile}>
            <div className="purr-logo-icon">🍔</div>
            <span className="purr-logo-text">CraveBite</span>
          </NavLink>
        </div>

        {/* Navigation List */}
        <nav className="purr-nav">
          <ul>
            {navItems.map((item) => {
              let isActive = false;
              
              if (item.path.includes('?')) {
                const [basePath, searchStr] = item.path.split('?');
                isActive = location.pathname === basePath && location.search.includes(searchStr);
              } else if (item.path === '/my-orders') {
                isActive = location.pathname === '/my-orders' && !location.search.includes('tab=history');
              } else {
                isActive = location.pathname === item.path;
              }

              return (
                <li key={item.label}>
                  <NavLink
                    to={item.path}
                    className={`purr-nav-link ${isActive ? 'active' : ''}`}
                    onClick={onCloseMobile}
                  >
                    <span className="purr-nav-icon">{item.icon}</span>
                    <span className="purr-nav-label">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="purr-nav-badge">{item.badge}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Sidebar Actions */}
        <div className="purr-sidebar-bottom">
          <button
            type="button"
            className="purr-bottom-btn donate-btn"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              if (onOpenDonation) onOpenDonation();
            }}
          >
            <span className="purr-nav-icon">🤍</span>
            <span>Donate to shelter</span>
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              className="purr-bottom-btn logout-btn"
              onClick={handleLogout}
            >
              <span className="purr-nav-icon">🚪</span>
              <span>Log out</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className="purr-bottom-btn login-btn"
              onClick={onCloseMobile}
            >
              <span className="purr-nav-icon">🔑</span>
              <span>Sign in</span>
            </NavLink>
          )}

          {isAuthenticated && user && (
            <NavLink
              to="/profile"
              className="purr-user-badge"
              onClick={onCloseMobile}
              style={{ textDecoration: 'none', cursor: 'pointer' }}
              title="View Profile & Settings"
            >
              <div className="purr-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="purr-user-info">
                <span className="purr-user-name">{user.name || 'Coffee Lover'}</span>
                <span className="purr-user-role">{role || 'Customer'}</span>
              </div>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
