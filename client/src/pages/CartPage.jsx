// src/pages/CartPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useCart } from '../hooks/useCart';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const savedAddressOptions = [
    {
      title: 'Home',
      street: user?.addresses?.[0]?.street || 'Flat 402, Lotus Boulevard, Sector 100, Noida',
      tag: 'Default',
    },
    {
      title: 'Office',
      street: user?.addresses?.[1]?.street || 'Cyber City, Tower B, 6th Floor, Gurugram',
      tag: 'Work',
    },
  ];

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [address, setAddress] = useState(savedAddressOptions[0].street);
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic delivery time and distance estimation
  const getDeliveryEstimate = () => {
    let dist = 2.8;
    const lower = address.toLowerCase();
    if (lower.includes('noida') || lower.includes('lotus')) {
      dist = 2.4;
    } else if (lower.includes('gurugram') || lower.includes('cyber')) {
      dist = 7.8;
    } else if (lower.includes('delhi') || lower.includes('connaught') || lower.includes('khan')) {
      dist = 4.2;
    } else {
      const hash = address.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      dist = Number(((hash % 45) / 10 + 2.0).toFixed(1));
    }

    const minTime = Math.round(15 + dist * 2.5);
    const maxTime = Math.round(20 + dist * 3.5);
    return {
      distanceKm: dist,
      timeString: `${minTime}-${maxTime} mins`,
    };
  };

  const deliveryEstimate = getDeliveryEstimate();

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');

    if (code === 'WELCOME50') {
      if (subtotal < 199) {
        setCouponError('WELCOME50 requires min order of ₹199');
        return;
      }
      applyCoupon({ code: 'WELCOME50', type: 'percentage', value: 50, maxDiscount: 100 });
      setCouponInput('');
    } else if (code === 'FLAT20') {
      if (subtotal < 99) {
        setCouponError('FLAT20 requires min order of ₹99');
        return;
      }
      applyCoupon({ code: 'FLAT20', type: 'fixed', value: 20 });
      setCouponInput('');
    } else if (code === 'FEAST100') {
      if (subtotal < 499) {
        setCouponError('FEAST100 requires min order of ₹499');
        return;
      }
      applyCoupon({ code: 'FEAST100', type: 'fixed', value: 100 });
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME50 or FLAT20');
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Please log in or select a demo account to complete your order.');
      navigate('/login');
      return;
    }

    if (!address.trim()) {
      alert('Please provide a delivery address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        '/api/orders',
        {
          items,
          total,
          address,
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      clearCart();
      navigate(`/order/${res.data._id}`);
    } catch (err) {
      console.error('Checkout failed', err);
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Looks like you haven't added anything to your cart yet. Explore gourmet flavors now!
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Explore Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 style={{ fontSize: '2.2rem', marginBottom: '24px' }}>Checkout & Review Order</h1>

      <div className="cart-layout">
        {/* Items Panel */}
        <div className="cart-items-panel glassmorphism">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Order Items ({items.length})</h2>
            <button onClick={clearCart} className="btn-small">
              Clear All
            </button>
          </div>

          <ul className="cart-list">
            {items.map((item) => {
              const itemKey = item.cartItemId || item._id;
              return (
                <li key={itemKey} className="cart-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="cart-item-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0 }}>{item.name}</h4>
                        {item.selectedVariant && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              background: 'var(--primary-light, rgba(224,122,60,0.15))',
                              color: 'var(--primary)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            {item.selectedVariant.name}
                          </span>
                        )}
                      </div>

                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          {item.selectedAddons.map((a) => `+ ${a.name} (₹${a.price})`).join(' • ')}
                        </div>
                      )}

                      {item.specialInstructions && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '2px' }}>
                          📝 "{item.specialInstructions}"
                        </div>
                      )}

                      <div className="cart-item-price" style={{ marginTop: '2px' }}>
                        ₹{item.price} each
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="qty-counter" style={{ padding: '4px 8px' }}>
                      <button onClick={() => updateQuantity(itemKey, item.quantity - 1)}>−</button>
                      <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(itemKey, item.quantity + 1)}>+</button>
                    </div>
                    <div style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>
                      ₹{item.price * item.quantity}
                    </div>
                    <button onClick={() => removeItem(itemKey)} className="btn-small">
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Delivery Address & Live Estimation */}
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>📍 Delivery Address</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {savedAddressOptions.map((opt, idx) => (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => {
                      setSelectedAddressIndex(idx);
                      setIsCustomAddress(false);
                      setAddress(opt.street);
                    }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: `1.5px solid ${!isCustomAddress && selectedAddressIndex === idx ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: !isCustomAddress && selectedAddressIndex === idx ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: !isCustomAddress && selectedAddressIndex === idx ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.title === 'Home' ? '🏠' : '🏢'} {opt.title}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomAddress(true);
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${isCustomAddress ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    background: isCustomAddress ? 'var(--primary-light)' : 'var(--bg-surface)',
                    color: isCustomAddress ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  ✏️ Custom
                </button>
              </div>
            </div>

            <textarea
              className="form-input"
              rows={2}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setIsCustomAddress(true);
              }}
              placeholder="Enter complete delivery street address, apartment, flat no..."
              style={{ width: '100%', marginBottom: '16px' }}
            />

            {/* Live Delivery Estimate Card */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                padding: '14px 16px',
                background: 'var(--bg-surface, #F7EDE3)',
                borderRadius: 'var(--radius-md, 14px)',
                border: '1px solid var(--border-subtle, #EDE0D4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>⏱️</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED TIME</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {deliveryEstimate.timeString}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>📍</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DISTANCE</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {deliveryEstimate.distanceKm} km away
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🛵</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DISPATCH STATUS</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--secondary, #27AE78)' }}>
                    Express Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>💳 Payment Method</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  background: paymentMethod === 'cod' ? 'rgba(255, 83, 48, 0.15)' : 'var(--bg-surface)',
                  border: `1.5px solid ${paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                💵 Cash on Delivery (COD)
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  background: paymentMethod === 'upi' ? 'rgba(255, 83, 48, 0.15)' : 'var(--bg-surface)',
                  border: `1.5px solid ${paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                />
                📱 UPI (GPay/PhonePe)
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  background: paymentMethod === 'card' ? 'rgba(255, 83, 48, 0.15)' : 'var(--bg-surface)',
                  border: `1.5px solid ${paymentMethod === 'card' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                💳 Credit / Debit Cards
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  background: paymentMethod === 'wallet' ? 'rgba(255, 83, 48, 0.15)' : 'var(--bg-surface)',
                  border: `1.5px solid ${paymentMethod === 'wallet' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={() => setPaymentMethod('wallet')}
                />
                💼 Wallets (Paytm/MobiKwik)
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Bill */}
        <div className="cart-summary-panel glassmorphism">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Bill Summary</h2>

          {/* Coupons */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
              HAVE A PROMO CODE?
            </div>
            {appliedCoupon ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>
                  🎉 {appliedCoupon.code} Applied (−₹{discount})
                </span>
                <button
                  onClick={removeCoupon}
                  style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontWeight: 700 }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="coupon-section" style={{ margin: 0 }}>
                <input
                  type="text"
                  placeholder="e.g. WELCOME50"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button onClick={() => handleApplyCoupon()} className="btn-secondary">
                  Apply
                </button>
              </div>
            )}
            {couponError && (
              <div style={{ color: 'var(--rose)', fontSize: '0.8rem', marginTop: '6px' }}>{couponError}</div>
            )}

            {/* Suggested coupons */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleApplyCoupon('WELCOME50')}
                className="demo-pill"
                style={{ fontSize: '0.75rem' }}
              >
                Use WELCOME50
              </button>
              <button
                type="button"
                onClick={() => handleApplyCoupon('FLAT20')}
                className="demo-pill"
                style={{ fontSize: '0.75rem' }}
              >
                Use FLAT20
              </button>
            </div>
          </div>

          <div className="bill-row">
            <span>Item Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="bill-row">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? (
                <strong style={{ color: 'var(--secondary)' }}>FREE</strong>
              ) : (
                `₹${deliveryFee}`
              )}
            </span>
          </div>

          <div className="bill-row">
            <span>Taxes & Restaurant Packaging (5%)</span>
            <span>₹{tax}</span>
          </div>

          {discount > 0 && (
            <div className="bill-row discount-row">
              <span>Coupon Savings</span>
              <span>−₹{discount}</span>
            </div>
          )}

          <div className="bill-row total-row">
            <span>To Pay</span>
            <span>₹{total}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '24px', padding: '14px 20px', fontSize: '1.05rem' }}
          >
            {isSubmitting ? 'Placing Order...' : `Place Order (₹${total}) ➔`}
          </button>

          {!isAuthenticated && (
            <div style={{ marginTop: '14px', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              Note: You can log in using 1-click test credentials.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
