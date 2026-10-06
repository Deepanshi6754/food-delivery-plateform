// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './components/Sidebar';
import DonateShelterModal from './components/DonateShelterModal';
import ToastContainer from './components/Toast';
import Home from './pages/Home';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import OrderTracking from './pages/OrderTracking';
import MyOrders from './pages/MyOrders';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import ReviewPage from './pages/ReviewPage';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="purr-app-root">
        {/* Global Toast Notifications */}
        <ToastContainer />

        {/* Mobile Header Bar */}
        <header className="purr-mobile-header">
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="mobile-brand">
            <span className="brand-cup">🍔</span>
            <span className="brand-name">CraveBite</span>
          </div>
          <button
            type="button"
            className="mobile-donate-btn"
            onClick={() => setIsDonationOpen(true)}
            title="Donate to Shelter"
          >
            🤍
          </button>
        </header>

        <div className="purr-layout">
          {/* Purr'Coffee Left Sidebar */}
          <Sidebar
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            onOpenDonation={() => setIsDonationOpen(true)}
          />

          {/* Main Content Area */}
          <main className="purr-main-viewport">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Home />} />
              <Route path="/restaurant/:id" element={<RestaurantPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order/:id" element={<OrderTracking />} />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delivery"
                element={
                  <ProtectedRoute allowedRoles={['delivery', 'admin']}>
                    <DeliveryDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/reviews/:restaurantId" element={<ReviewPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Shelter Donation Modal */}
        <DonateShelterModal
          isOpen={isDonationOpen}
          onClose={() => setIsDonationOpen(false)}
        />
      </div>
    </Router>
  );
};

export default App;
