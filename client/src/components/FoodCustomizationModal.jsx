// client/src/components/FoodCustomizationModal.jsx
import React, { useState, useEffect } from 'react';

const FoodCustomizationModal = ({ item, restaurant, isOpen, onClose, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) {
      if (item.variants && item.variants.length > 0) {
        setSelectedVariant(item.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setSelectedAddons([]);
      setInstructions('');
      setQuantity(1);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const basePrice = selectedVariant ? selectedVariant.price : item.price;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon) => {
    const exists = selectedAddons.some((a) => a.name === addon.name);
    if (exists) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleConfirm = () => {
    const customizedItem = {
      _id: item._id,
      name: item.name,
      restaurant: restaurant?._id || item.restaurant,
      restaurantName: restaurant?.name || item.restaurantName || 'Restaurant',
      image: item.image,
      isVeg: item.isVeg,
      basePrice: item.price,
      price: unitPrice,
      selectedVariant: selectedVariant || null,
      selectedAddons: selectedAddons || [],
      specialInstructions: instructions.trim(),
      quantity,
    };
    onAddToCart(customizedItem);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="customization-modal glassmorphism"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card, #ffffff)',
          color: 'var(--text-main, #1a1a1a)',
          borderRadius: 'var(--radius-lg, 20px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle, #EDE0D4)',
        }}
      >
        {/* Header with image */}
        <div style={{ position: 'relative', height: item.image ? '160px' : 'auto', background: 'var(--bg-surface)' }}>
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                width: '14px',
                height: '14px',
                border: `2px solid ${item.isVeg ? '#10B981' : '#EF4444'}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '3px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: item.isVeg ? '#10B981' : '#EF4444',
                }}
              />
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {item.category || 'Specialty'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px 0' }}>{item.name}</h2>
          {item.description && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
              {item.description}
            </p>
          )}

          {/* Variants Section (Mandatory if present) */}
          {item.variants && item.variants.length > 0 && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Select Size / Portion</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: 'var(--primary-light, rgba(224,122,60,0.15))',
                    color: 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                  }}
                >
                  REQUIRED
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {item.variants.map((variant) => {
                  const isSelected = selectedVariant?.name === variant.name;
                  return (
                    <label
                      key={variant.name}
                      onClick={() => setSelectedVariant(variant)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md, 12px)',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle, #EDE0D4)'}`,
                        background: isSelected ? 'var(--primary-light, rgba(224,122,60,0.08))' : 'var(--bg-surface, #F7EDE3)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="radio"
                          name="variant"
                          checked={isSelected}
                          onChange={() => setSelectedVariant(variant)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{variant.name}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{variant.price}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons Section (Optional) */}
          {item.addons && item.addons.length > 0 && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Add-ons & Extras</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OPTIONAL</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {item.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <label
                      key={addon.name}
                      onClick={() => toggleAddon(addon)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md, 12px)',
                        border: `1.5px solid ${isChecked ? 'var(--secondary, #27AE78)' : 'var(--border-subtle, #EDE0D4)'}`,
                        background: isChecked ? 'rgba(39, 174, 120, 0.08)' : 'var(--bg-surface, #F7EDE3)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          style={{ accentColor: 'var(--secondary, #27AE78)', width: '16px', height: '16px' }}
                        />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{addon.name}</span>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--secondary, #27AE78)' }}>
                        +₹{addon.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
              Special Cooking Instructions (Optional)
            </span>
            <input
              type="text"
              placeholder="e.g. Less spicy, keep sauce on the side..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="form-input"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm, 8px)',
                border: '1px solid var(--border-subtle, #EDE0D4)',
                background: 'var(--bg-input, #F5EFEA)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Footer with Quantity Counter & Add CTA */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle, #EDE0D4)',
            background: 'var(--bg-surface, #F7EDE3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Stepper */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-card, #fff)',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--border-subtle)',
              padding: '4px 8px',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{
                width: '30px',
                height: '30px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}
            >
              −
            </button>
            <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '18px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              style={{
                width: '30px',
                height: '30px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}
            >
              +
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary"
            style={{
              flex: 1,
              padding: '12px 20px',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Add to Order</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCustomizationModal;
