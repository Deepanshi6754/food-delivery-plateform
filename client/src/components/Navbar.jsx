// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useCart } from '../hooks/useCart';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, role } = useSelector((state) => state.auth);
  const { itemCount } = useCart();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <div className="logo-icon">🍔</div>
          <span>FoodDelight</span>
        </Link>

        <ul className="menu">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              🏠 Home
            </Link>
          </li>

          {isAuthenticated && (
            <li>
              <Link to="/my-orders" className={location.pathname === '/my-orders' ? 'active' : ''}>
                📋 My Orders
              </Link>
            </li>
          )}

          {role === 'admin' && (
            <li>
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                ⚙️ Admin
              </Link>
            </li>
          )}

          {(role === 'owner' || role === 'admin') && (
            <li>
              <Link to="/owner" className={location.pathname === '/owner' ? 'active' : ''}>
                🏪 Partner
              </Link>
            </li>
          )}

          {(role === 'delivery' || role === 'admin') && (
            <li>
              <Link to="/delivery" className={location.pathname === '/delivery' ? 'active' : ''}>
                🛵 Rider
              </Link>
            </li>
          )}

          <li>
            <Link to="/cart" className={`cart-badge-link ${location.pathname === '/cart' ? 'active' : ''}`}>
              🛒 Cart
              {itemCount > 0 && <span className="badge-count">{itemCount}</span>}
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <div className="user-badge">
                  <span>👤 {user?.name?.split(' ')[0] || 'User'}</span>
                  <span className={`role-tag ${role}`}>{role}</span>
                </div>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-small">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="btn-primary" style={{ padding: '9px 20px' }}>
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
