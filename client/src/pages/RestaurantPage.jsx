import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../hooks/useCart';
import { toast } from '../components/Toast';
import FoodCustomizationModal from '../components/FoodCustomizationModal';
import CoffeeCard from '../components/CoffeeCard';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [customizingItem, setCustomizingItem] = useState(null);

  const { items, addItem, updateQuantity, itemCount, total } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [restRes, foodRes] = await Promise.all([
          axios.get(`/api/restaurants/${id}`),
          axios.get(`/api/foods?restaurant=${id}`),
        ]);
        setRestaurant(restRes.data);
        setMenu(foodRes.data || (restRes.data && restRes.data.foods) || []);
      } catch (err) {
        console.error('Failed to load restaurant data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🍽️</div>
        <p>Loading menu and chef specials...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Restaurant not found</h2>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Home
        </button>
      </div>
    );
  }

  // Get distinct categories
  const categories = ['All', ...new Set(menu.map((m) => m.category || 'Main Course'))];

  // Filtered menu
  const filteredMenu = menu.filter((item) => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (vegOnly && !item.isVeg) return false;
    return true;
  });

  const getItemQuantity = (foodId) => {
    const targetId = String(foodId);
    return items
      .filter((i) => String(i._id) === targetId || i.cartItemId === targetId)
      .reduce((sum, i) => sum + (i.quantity || 1), 0);
  };

  const handleAdd = (food, qty = 1) => {
    const hasCustomization =
      (food.variants && food.variants.length > 0) || (food.addons && food.addons.length > 0);

    if (hasCustomization) {
      setCustomizingItem(food);
    } else {
      addItem({
        _id: food._id,
        name: food.name,
        price: food.price,
        restaurant: restaurant._id,
        restaurantName: restaurant.name,
        image: food.image,
        isVeg: food.isVeg,
        category: food.category,
        selectedSize: food.selectedSize,
        quantity: qty,
      });
      toast.success(`Added ${food.name} to cart!`);
    }
  };

  const handleUpdateQuantity = (foodId, qty) => {
    const targetId = String(foodId);
    // Find the cart item key
    const foundItems = items.filter((i) => String(i._id) === targetId || i.cartItemId === targetId);
    if (foundItems.length > 0) {
      const lastItem = foundItems[foundItems.length - 1];
      const key = lastItem.cartItemId || lastItem._id;
      updateQuantity(key, qty);
    }
  };

  return (
    <div className="restaurant-page">
      {/* Hero Header */}
      <div className="restaurant-hero">
        <img
          src={restaurant.banner || restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
          alt={restaurant.name}
        />
        <div className="restaurant-hero-overlay">
          <div className="restaurant-info-box">
            <h1>{restaurant.name}</h1>
            <p style={{ color: '#E2E8F0', fontSize: '1rem', maxWidth: '650px', marginBottom: '12px' }}>
              {restaurant.description}
            </p>
            <div className="restaurant-meta-row">
              <span className="rating-badge">★ {restaurant.rating?.toFixed(1) || '4.5'}</span>
              <span>📍 {restaurant.address}</span>
              <span>⏱️ {restaurant.deliveryTime || '25-35 mins'}</span>
              <span>🏷️ {restaurant.offer || 'Special Discount Available'}</span>
              <Link
                to={`/reviews/${restaurant._id}`}
                style={{ color: 'var(--amber)', textDecoration: 'underline', fontWeight: 600 }}
              >
                View Customer Reviews ({restaurant.ratingCount || 10})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Filters & Category Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div className="menu-nav-tabs" style={{ margin: 0, border: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`menu-tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Veg Only Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--secondary)' }}
          />
          <span style={{ color: '#10B981' }}>🌱 Pure Veg Dishes</span>
        </label>
      </div>

      {/* Menu Grid */}
      <div className="purr-coffee-grid">
        {filteredMenu.map((item) => (
          <CoffeeCard
            key={item._id}
            item={item}
            cartQuantity={getItemQuantity(item._id)}
            onAdd={(product, qty) => handleAdd(product, qty)}
            onUpdateQuantity={handleUpdateQuantity}
          />
        ))}
      </div>

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <div className="floating-cart-bar">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} added from <strong>{restaurant.name}</strong>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              ₹{total} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-dim)' }}>(incl. taxes)</span>
            </div>
          </div>
          <button onClick={() => navigate('/cart')} className="btn-primary" style={{ padding: '10px 24px' }}>
            View Cart & Checkout ➔
          </button>
        </div>
      )}

      {/* Food Customization Modal */}
      <FoodCustomizationModal
        item={customizingItem}
        restaurant={restaurant}
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={(customItem) => {
          addItem(customItem);
          toast.success(`Added ${customItem.name} to cart!`);
        }}
      />
    </div>
  );
};

export default RestaurantPage;
