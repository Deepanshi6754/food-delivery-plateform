// src/components/CoffeeCard.jsx (Unified Food & Dish Card)
import React, { useState } from 'react';

const CoffeeCard = ({ item, cartQuantity, onAdd, onUpdateQuantity }) => {
  const [selectedPortion, setSelectedPortion] = useState('Regular');
  const [localQty, setLocalQty] = useState(1);

  const basePrice = Number(item.price) || 199;
  const currentPrice = selectedPortion === 'Large' ? Math.round(basePrice * 1.3) : basePrice;

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (cartQuantity > 0) {
      onUpdateQuantity(item._id, cartQuantity + 1);
    } else {
      setLocalQty((prev) => prev + 1);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (cartQuantity > 0) {
      onUpdateQuantity(item._id, cartQuantity - 1);
    } else {
      setLocalQty((prev) => (prev > 1 ? prev - 1 : 1));
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const qtyToAdd = cartQuantity > 0 ? 1 : localQty;
    onAdd(
      {
        ...item,
        selectedSize: selectedPortion,
        price: currentPrice,
      },
      qtyToAdd
    );
  };

  const displayQty = cartQuantity > 0 ? cartQuantity : localQty;

  return (
    <div className="purr-coffee-card">
      <div className="purr-card-img-wrap">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
          alt={item.name}
          loading="lazy"
        />
        {item.badge && (
          <span className="purr-card-badge">{item.badge}</span>
        )}
        <div
          className={`veg-indicator ${item.isVeg ? '' : 'non-veg'}`}
          style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 3 }}
          title={item.isVeg ? 'Pure Veg' : 'Non-Veg'}
        >
          <div className="dot" />
        </div>
      </div>

      <div className="purr-card-content">
        <div className="purr-card-header">
          <h3 className="purr-card-title">{item.name}</h3>
          <span className="purr-card-price" style={{ color: 'var(--primary)', fontWeight: 800 }}>
            ₹{currentPrice}
          </span>
        </div>

        <p className="purr-card-desc">{item.description}</p>

        {item.restaurantName && (
          <span style={{ fontSize: '0.74rem', color: '#8c7668', display: 'block', marginBottom: '8px' }}>
            🍽️ {item.restaurantName}
          </span>
        )}

        {/* Portion Selector */}
        <div className="purr-size-section">
          <span className="purr-size-label">Portion</span>
          <div className="purr-size-pills">
            <button
              type="button"
              className={`purr-size-pill ${selectedPortion === 'Regular' ? 'active' : ''}`}
              onClick={() => setSelectedPortion('Regular')}
            >
              Regular
            </button>
            <button
              type="button"
              className={`purr-size-pill ${selectedPortion === 'Large' ? 'active' : ''}`}
              onClick={() => setSelectedPortion('Large')}
            >
              Large (+30%)
            </button>
          </div>
        </div>

        {/* Bottom Actions Row: Stepper + Add to Cart */}
        <div className="purr-card-bottom">
          <div className="purr-stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="stepper-value">{displayQty}</span>
            <button
              type="button"
              className="stepper-btn"
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="btn-purr-add-cart"
            onClick={handleAddToCart}
          >
            {cartQuantity > 0 ? `Added (${cartQuantity}) ✓` : 'Add to Cart +'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;
