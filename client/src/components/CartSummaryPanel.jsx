// src/components/CartSummaryPanel.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CartSummaryPanel = ({
  items,
  subtotal,
  discount,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'dinein' | 'takeaway'
  const [placedSuccess, setPlacedSuccess] = useState(false);

  // Delivery fee based on type
  const deliveryFee = orderType === 'delivery' ? (subtotal > 25 ? 0 : 3.50) : 0;
  const appliedDiscount = discount || (subtotal > 20 ? 4.00 : 0);
  const tax = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = Number(Math.max(0, subtotal + deliveryFee + tax - appliedDiscount).toFixed(2));

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    if (onCheckout) {
      onCheckout({ orderType, grandTotal });
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="purr-cart-summary-panel">
      <h2 className="purr-cart-panel-title">Cart summary</h2>

      {/* Order Type Tabs: Delivery | Dine in | Take away */}
      <div className="purr-order-type-tabs">
        <button
          type="button"
          className={`purr-type-tab ${orderType === 'delivery' ? 'active' : ''}`}
          onClick={() => setOrderType('delivery')}
        >
          <span className="tab-icon">🛵</span>
          <span>Delivery</span>
        </button>

        <button
          type="button"
          className={`purr-type-tab ${orderType === 'dinein' ? 'active' : ''}`}
          onClick={() => setOrderType('dinein')}
        >
          <span className="tab-icon">🍴</span>
          <span>Dine in</span>
        </button>

        <button
          type="button"
          className={`purr-type-tab ${orderType === 'takeaway' ? 'active' : ''}`}
          onClick={() => setOrderType('takeaway')}
        >
          <span className="tab-icon">🛍️</span>
          <span>Take away</span>
        </button>
      </div>

      {/* Cart Items List */}
      <div className="purr-cart-items-container">
        {items.length === 0 ? (
          <div className="purr-empty-cart-msg">
            <div className="empty-mug">🍔</div>
            <p>Your food cart is empty</p>
            <span>Add delicious dishes from the menu!</span>
          </div>
        ) : (
          <div className="purr-cart-items-list">
            {items.map((item) => {
              const itemKey = item.cartItemId || String(item._id);
              return (
                <div key={itemKey} className="purr-cart-item-row">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100'}
                    alt={item.name}
                    className="purr-cart-item-thumb"
                  />
                  <div className="purr-cart-item-meta">
                    <span className="purr-cart-item-title" title={item.name}>
                      {item.name}
                    </span>
                    <span className="purr-cart-item-unit-price">
                      ₹{Number(item.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="purr-cart-item-stepper">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Financials Calculation */}
      <div className="purr-cart-breakdown">
        <div className="breakdown-line">
          <span>Price</span>
          <strong>₹{subtotal.toFixed(2)}</strong>
        </div>

        {appliedDiscount > 0 && (
          <div className="breakdown-line discount-line">
            <span>Discount applied</span>
            <strong className="discount-text">-₹{appliedDiscount.toFixed(2)}</strong>
          </div>
        )}

        {orderType === 'delivery' && (
          <div className="breakdown-line">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}</span>
          </div>
        )}

        <div className="breakdown-line grand-total-line">
          <span>Grand total</span>
          <strong className="grand-total-val">₹{grandTotal.toFixed(2)}</strong>
        </div>
      </div>

      {/* Bottom Place Order CTA */}
      <button
        type="button"
        className="btn-purr-place-order"
        disabled={items.length === 0}
        onClick={handlePlaceOrder}
      >
        {items.length === 0 ? 'Cart Empty' : `Proceed to Checkout (₹${grandTotal.toFixed(2)}) ➔`}
      </button>
    </div>
  );
};

export default CartSummaryPanel;
