// src/components/FilterModal.jsx
import React from 'react';

const FilterModal = ({ isOpen, onClose, filters, setFilters, onReset }) => {
  if (!isOpen) return null;

  return (
    <div className="purr-modal-backdrop" onClick={onClose}>
      <div className="purr-filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>Filter Coffee & Bites</h3>
          <button className="purr-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="filter-group">
          <label className="filter-label">Sort By</label>
          <div className="filter-pills-row">
            {[
              { id: 'popular', label: '⭐ Most Popular' },
              { id: 'price-asc', label: '💵 Price: Low to High' },
              { id: 'price-desc', label: '💰 Price: High to Low' },
              { id: 'rating', label: '🏆 Top Rated' },
            ].map((sort) => (
              <button
                key={sort.id}
                type="button"
                className={`filter-chip ${filters.sort === sort.id ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, sort: sort.id })}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Temperature / Roast</label>
          <div className="filter-pills-row">
            {[
              { id: 'all', label: 'All Roasts' },
              { id: 'iced', label: '❄️ Iced & Cold Brew' },
              { id: 'hot', label: '🔥 Steaming Hot' },
              { id: 'pour-over', label: '☕ Manual Pour Over' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                className={`filter-chip ${filters.type === type.id ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, type: type.id })}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Dietary Preferences</label>
          <div className="filter-checkbox-grid">
            <label className="filter-check-item">
              <input
                type="checkbox"
                checked={filters.dairyFree}
                onChange={(e) => setFilters({ ...filters, dairyFree: e.target.checked })}
              />
              <span>🥛 Oat / Almond Milk (Dairy-Free)</span>
            </label>
            <label className="filter-check-item">
              <input
                type="checkbox"
                checked={filters.decaf}
                onChange={(e) => setFilters({ ...filters, decaf: e.target.checked })}
              />
              <span>🌿 Decaf / Low Caffeine</span>
            </label>
            <label className="filter-check-item">
              <input
                type="checkbox"
                checked={filters.vegan}
                onChange={(e) => setFilters({ ...filters, vegan: e.target.checked })}
              />
              <span>🌱 100% Plant Based / Vegan</span>
            </label>
          </div>
        </div>

        <div className="filter-actions-row">
          <button type="button" className="btn-purr-secondary" onClick={onReset}>
            Reset All
          </button>
          <button type="button" className="btn-purr-primary" onClick={onClose}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
