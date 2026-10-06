// src/components/DonateShelterModal.jsx
import React, { useState } from 'react';

const DonateShelterModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState(3);
  const [customAmount, setCustomAmount] = useState('');
  const [donated, setDonated] = useState(false);
  const [selectedPet, setSelectedPet] = useState('🐱 Whiskers');

  if (!isOpen) return null;

  const handleDonate = (e) => {
    e.preventDefault();
    setDonated(true);
    setTimeout(() => {
      setDonated(false);
      onClose();
    }, 2500);
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  return (
    <div className="purr-modal-backdrop" onClick={onClose}>
      <div className="purr-modal" onClick={(e) => e.stopPropagation()}>
        <button className="purr-modal-close" onClick={onClose}>✕</button>

        {donated ? (
          <div className="purr-donation-success">
            <div className="success-icon">🐾☕❤️</div>
            <h3>Thank You for Your Kindness!</h3>
            <p>
              Your <strong>${finalAmount.toFixed(2)}</strong> donation will provide warm meals and medical care for shelter cats and dogs!
            </p>
            <div className="purr-badge-stamp">Verified Shelter Partner</div>
          </div>
        ) : (
          <div className="purr-donation-content">
            <div className="purr-donation-header">
              <div className="shelter-icon">🐱</div>
              <div>
                <h2>Donate to Animal Shelter</h2>
                <p>100% of your gift goes directly to local rescued cats & dogs.</p>
              </div>
            </div>

            <div className="shelter-progress-card">
              <div className="progress-info">
                <span>Monthly Shelter Goal</span>
                <strong>$2,480 / $3,000</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '82%' }}></div>
              </div>
              <div className="progress-sub">82% raised — 142 shelter pets supported this month! 🐾</div>
            </div>

            <div className="donation-amounts">
              <label className="amount-label">Choose Donation Amount</label>
              <div className="amount-buttons">
                {[1, 3, 5, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`amount-pill ${amount === val && !customAmount ? 'active' : ''}`}
                    onClick={() => {
                      setAmount(val);
                      setCustomAmount('');
                    }}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              <div className="custom-amount-wrap">
                <span>Custom: $</span>
                <input
                  type="number"
                  placeholder="Other amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="shelter-pet-dedicate">
              <label>Sponsor a Shelter Resident:</label>
              <div className="pet-selector">
                {['🐱 Whiskers (Tabby Cat)', '🐶 Bruno (Golden Pup)', '🐱 Luna (Calico Kitten)'].map((pet) => (
                  <button
                    type="button"
                    key={pet}
                    className={`pet-pill ${selectedPet === pet ? 'active' : ''}`}
                    onClick={() => setSelectedPet(pet)}
                  >
                    {pet}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="btn-purr-action" onClick={handleDonate}>
              Send ${finalAmount ? finalAmount.toFixed(2) : '3.00'} Love 🐾
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateShelterModal;
