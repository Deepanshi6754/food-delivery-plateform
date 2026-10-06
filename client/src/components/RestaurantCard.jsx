// src/components/RestaurantCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  return (
    <div
      className="purr-coffee-card"
      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="purr-card-img-wrap">
        <img
          src={restaurant.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'}
          alt={restaurant.name}
          loading="lazy"
        />
        {restaurant.offer && (
          <span className="purr-card-badge">{restaurant.offer}</span>
        )}
      </div>

      <div className="purr-card-content">
        <div className="purr-card-header">
          <h3 className="purr-card-title">{restaurant.name}</h3>
          <span style={{ color: 'var(--amber)', fontWeight: 800, fontSize: '0.95rem' }}>
            ★ {restaurant.rating ? restaurant.rating.toFixed(1) : '4.5'}
          </span>
        </div>

        <p className="purr-card-desc">
          {Array.isArray(restaurant.cuisine)
            ? restaurant.cuisine.join(' • ')
            : restaurant.cuisine || 'Gourmet, Multi-Cuisine'}
        </p>

        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 500 }}>
          📍 {restaurant.address?.split(',')[0] || 'Local'}
        </span>

        {/* Portion-like section for Delivery Info */}
        <div className="purr-size-section">
          <span className="purr-size-label">Delivery Info</span>
          <div className="purr-size-pills">
            <div className="purr-size-pill active">
              {restaurant.deliveryFee === 0 ? 'FREE' : `₹${restaurant.deliveryFee || 40}`}
            </div>
            <div className="purr-size-pill">
              ⏱️ {restaurant.deliveryTime || '25-35 mins'}
            </div>
          </div>
        </div>

        {/* Bottom Actions Row matching Coffee Card */}
        <div className="purr-card-bottom">
          <button
            type="button"
            className="btn-purr-add-cart"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/restaurant/${restaurant._id}`);
            }}
          >
            Order Food ➔
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
