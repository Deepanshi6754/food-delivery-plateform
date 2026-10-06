// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CoffeeCard from '../components/CoffeeCard';
import CartSummaryPanel from '../components/CartSummaryPanel';
import RestaurantCard from '../components/RestaurantCard';
import FilterModal from '../components/FilterModal';
import { toast } from '../components/Toast';
import { PURR_CATEGORIES, PURR_COFFEE_ITEMS } from '../data/coffeeData';
import { useCart } from '../hooks/useCart';

const RESTAURANT_CUISINES = [
  'All',
  'Burgers',
  'Pizza',
  'Sushi',
  'Indian',
  'Healthy',
  'Desserts',
  'Coffee',
];

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab: 'restaurants' or 'coffee'
  const isMenuRoute = location.pathname === '/menu';
  const [activeTab, setActiveTab] = useState(isMenuRoute ? 'coffee' : 'restaurants');

  // Restaurant state
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantCuisine, setRestaurantCuisine] = useState('All');
  const [restaurantSort, setRestaurantSort] = useState('rating');
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  // Coffee menu state
  const [items, setItems] = useState(PURR_COFFEE_ITEMS);
  const [activeCategory, setActiveCategory] = useState('Coffee');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCartPanel, setShowCartPanel] = useState(true);

  const [filters, setFilters] = useState({
    sort: 'popular',
    type: 'all',
    dairyFree: false,
    decaf: false,
    vegan: false,
  });

  const {
    items: cartItems,
    addItem,
    updateQuantity,
    removeItem,
    itemCount,
    subtotal,
    discount,
    total,
  } = useCart();

  // Sync tab with route if location changes
  useEffect(() => {
    if (location.pathname === '/menu') {
      setActiveTab('coffee');
    }
  }, [location.pathname]);

  // Fetch restaurants & backend foods
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingRestaurants(true);
        const [restRes, foodRes] = await Promise.all([
          axios.get('/api/restaurants').catch(() => ({ data: [] })),
          axios.get('/api/foods').catch(() => ({ data: [] })),
        ]);

        if (restRes.data && restRes.data.length > 0) {
          setRestaurants(restRes.data);
        }

        if (foodRes.data && foodRes.data.length > 0) {
          const mapped = foodRes.data.map((f) => ({
            _id: f._id,
            name: f.name,
            price: f.price,
            category: f.category || 'Coffee',
            description: f.description,
            image: f.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
            isVeg: f.isVeg,
            rating: f.rating || 4.8,
            restaurant: f.restaurant,
          }));

          // Merge backend foods with local items, prioritizing backend IDs
          const combined = [...mapped];
          PURR_COFFEE_ITEMS.forEach((local) => {
            if (!combined.some((b) => b.name.toLowerCase() === local.name.toLowerCase())) {
              combined.push(local);
            }
          });
          setItems(combined);
        }
      } catch (err) {
        console.log('Using local fallback data');
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchData();
  }, []);

  const handleResetFilters = () => {
    setFilters({
      sort: 'popular',
      type: 'all',
      dairyFree: false,
      decaf: false,
      vegan: false,
    });
    setIsFilterOpen(false);
  };

  const getCartQuantity = (id) => {
    const targetId = String(id);
    const found = cartItems.find((i) => String(i._id) === targetId || i.cartItemId === targetId);
    return found ? found.quantity : 0;
  };

  const handleAddToCart = (product, qty = 1) => {
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      isVeg: product.isVeg,
      category: product.category,
      selectedSize: product.selectedSize,
      restaurant: product.restaurant,
      restaurantName:
        product.restaurantName ||
        (typeof product.restaurant === 'object' && product.restaurant?.name) ||
        "CraveBite",
      quantity: qty,
    });
    toast.success(`Added ${product.name} to cart!`);
  };

  // Filter & Search logic for Coffee items
  const filteredCoffeeItems = items
    .filter((item) => {
      if (activeCategory && item.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      if (filters.type !== 'all' && item.type && item.type !== filters.type) {
        return false;
      }
      if (filters.vegan && !item.isVeg) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === 'price-asc') return a.price - b.price;
      if (filters.sort === 'price-desc') return b.price - a.price;
      if (filters.sort === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  // Filter & Search logic for Restaurants
  const filteredRestaurants = restaurants
    .filter((rest) => {
      if (restaurantCuisine !== 'All') {
        const cuisines = Array.isArray(rest.cuisine)
          ? rest.cuisine
          : (rest.cuisine || '').split(',').map((c) => c.trim());
        const matchesCuisine = cuisines.some((c) =>
          c.toLowerCase().includes(restaurantCuisine.toLowerCase())
        );
        if (!matchesCuisine) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rest.name.toLowerCase().includes(q);
        const matchesDesc = rest.description?.toLowerCase().includes(q);
        const matchesAddress = rest.address?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesAddress) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (restaurantSort === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (restaurantSort === 'fee') return (a.deliveryFee || 0) - (b.deliveryFee || 0);
      if (restaurantSort === 'deliveryTime') {
        const getTimeNum = (s) => parseInt(s) || 30;
        return getTimeNum(a.deliveryTime) - getTimeNum(b.deliveryTime);
      }
      return 0;
    });

  return (
    <div className="purr-main-container">
      {/* Top Search & Filter Bar */}
      <div className="purr-topbar">
        <div className="purr-search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="purr-search-input"
            placeholder={
              activeTab === 'restaurants'
                ? 'Search restaurants, cuisines, or locations...'
                : 'Search coffee, snacks, or desserts...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {activeTab === 'coffee' && (
          <button
            type="button"
            className="purr-filter-btn"
            onClick={() => setIsFilterOpen(true)}
          >
            <span className="filter-lines-icon">≡</span>
            <span>Filter</span>
          </button>
        )}

        {/* Quick Cart summary toggle */}
        <button
          type="button"
          className={`purr-cart-toggle-btn ${showCartPanel ? 'active' : ''}`}
          onClick={() => setShowCartPanel(!showCartPanel)}
          title={showCartPanel ? 'Hide Cart Panel' : 'Show Cart Panel'}
        >
          <span>🛒</span>
          {itemCount > 0 && <span className="toggle-badge">{itemCount}</span>}
        </button>
      </div>

      {/* Main View Mode Slider */}
      <div className="crave-segment-slider">
        <button
          type="button"
          className={`segment-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          🍽️ Gourmet Restaurants ({restaurants.length})
        </button>

        <button
          type="button"
          className={`segment-btn ${activeTab === 'coffee' ? 'active' : ''}`}
          onClick={() => setActiveTab('coffee')}
        >
          ☕ CraveBite Express Menu
        </button>
        <div className={`segment-indicator ${activeTab}`} />
      </div>

      {/* ── TAB 1: RESTAURANTS VIEW ── */}
      {activeTab === 'restaurants' ? (
        <div>
          {/* Cuisine Category Pills & Sorting Bar */}
          <div className="purr-header-section" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div className="purr-category-bar" style={{ margin: 0 }}>
                {RESTAURANT_CUISINES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`purr-category-pill ${restaurantCuisine === cat ? 'active' : ''}`}
                    onClick={() => setRestaurantCuisine(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  SORT:
                </span>
                <select
                  value={restaurantSort}
                  onChange={(e) => setRestaurantSort(e.target.value)}
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <option value="rating">★ Top Rated</option>
                  <option value="deliveryTime">⏱️ Fastest Delivery</option>
                  <option value="fee">🛵 Lowest Delivery Fee</option>
                </select>
              </div>
            </div>
          </div>

          {/* Restaurants Grid + Sidebar Cart Layout */}
          <div className={`purr-content-layout ${showCartPanel ? 'with-cart' : 'full-width'}`}>
            <div className="purr-products-area">
              {loadingRestaurants ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🍽️</div>
                  <p>Discovering gourmet kitchens near you...</p>
                </div>
              ) : filteredRestaurants.length === 0 ? (
                <div className="purr-empty-results">
                  <div className="empty-icon">🍽️</div>
                  <h3>No kitchens match your filter</h3>
                  <p>Try searching for a different cuisine or resetting your filters.</p>
                  <button
                    type="button"
                    className="btn-purr-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setRestaurantCuisine('All');
                    }}
                  >
                    Show All Restaurants
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: '24px',
                  }}
                >
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                  ))}
                </div>
              )}
            </div>

            {/* Right Side Cart Summary Panel */}
            {showCartPanel && (
              <aside className="purr-cart-sidebar-wrap">
                <CartSummaryPanel
                  items={cartItems}
                  subtotal={subtotal}
                  discount={discount}
                  total={total}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                  onCheckout={() => navigate('/cart')}
                />
              </aside>
            )}
          </div>
        </div>
      ) : (
        /* ── TAB 2: PURR'COFFEE MENU VIEW ── */
        <div>
          {/* Title & Category Pills */}
          <div className="purr-header-section">
            <h1 className="purr-page-title">Coffee menu</h1>

            <div className="purr-category-bar">
              {PURR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`purr-category-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content Layout: Coffee Cards Grid + Cart summary Panel */}
          <div className={`purr-content-layout ${showCartPanel ? 'with-cart' : 'full-width'}`}>
            {/* Coffee Cards Grid */}
            <div className="purr-products-area">
              {filteredCoffeeItems.length === 0 ? (
                <div className="purr-empty-results">
                  <div className="empty-icon">☕</div>
                  <h3>No items found</h3>
                  <p>Try searching for a different coffee, snack or dessert.</p>
                  <button
                    type="button"
                    className="btn-purr-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('Coffee');
                      handleResetFilters();
                    }}
                  >
                    Reset Search & Filters
                  </button>
                </div>
              ) : (
                <div className="purr-coffee-grid">
                  {filteredCoffeeItems.map((item) => (
                    <CoffeeCard
                      key={item._id}
                      item={item}
                      cartQuantity={getCartQuantity(item._id)}
                      onAdd={handleAddToCart}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Side Cart Summary Panel */}
            {showCartPanel && (
              <aside className="purr-cart-sidebar-wrap">
                <CartSummaryPanel
                  items={cartItems}
                  subtotal={subtotal}
                  discount={discount}
                  total={total}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                  onCheckout={() => navigate('/cart')}
                />
              </aside>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default Home;
