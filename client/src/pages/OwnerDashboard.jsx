// src/pages/OwnerDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const OwnerDashboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // New food state
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodCategory, setFoodCategory] = useState('Burgers');
  const [foodImage, setFoodImage] = useState('');
  const [isVeg, setIsVeg] = useState(false);
  const [addingFood, setAddingFood] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch restaurants list safely
      try {
        const restRes = await axios.get('/api/restaurants');
        const rList = Array.isArray(restRes.data) ? restRes.data : [];
        setRestaurants(rList);
        if (rList.length > 0) {
          const currentRest = selectedRestaurant?._id
            ? rList.find((r) => r._id === selectedRestaurant._id) || rList[0]
            : rList[0];
          setSelectedRestaurant(currentRest);

          try {
            const foodRes = await axios.get(`/api/foods?restaurant=${currentRest._id}`);
            setFoods(Array.isArray(foodRes.data) ? foodRes.data : []);
          } catch {
            setFoods([]);
          }
        }
      } catch (restErr) {
        console.warn('Restaurants fetch notice:', restErr?.message || restErr);
      }

      // 2. Fetch orders list safely
      if (token) {
        try {
          const ordersRes = await axios.get('/api/orders', { headers });
          setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        } catch (orderErr) {
          console.warn('Orders queue notice:', orderErr?.response?.data?.message || orderErr.message);
          setOrders([]);
        }
      }
    } catch (err) {
      console.warn('Notice loading owner data:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus }, { headers });
      fetchData();
    } catch (err) {
      console.error('Update status failed', err);
    }
  };

  const handleAssignDelivery = async (orderId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`/api/orders/${orderId}/assign`, {}, { headers });
      fetchData();
    } catch (err) {
      console.error('Assign delivery failed', err);
    }
  };

  const handleCreateFood = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    try {
      setAddingFood(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        '/api/foods',
        {
          name: foodName,
          price: Number(foodPrice),
          description: foodDesc,
          category: foodCategory,
          image: foodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
          isVeg,
          restaurant: selectedRestaurant._id,
        },
        { headers }
      );
      // Reset form
      setFoodName('');
      setFoodPrice('');
      setFoodDesc('');
      setFoodImage('');
      setShowAddModal(false);
      // Refresh foods
      const foodRes = await axios.get(`/api/foods?restaurant=${selectedRestaurant._id}`);
      setFoods(foodRes.data);
    } catch (err) {
      console.error('Add food error', err);
      alert(err.response?.data?.message || 'Failed to add food item');
    } finally {
      setAddingFood(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🍳</div>
        <p>Loading kitchen portal...</p>
      </div>
    );
  }

  return (
    <div className="owner-dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '4px' }}>Kitchen & Restaurant Portal</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Logged in as <strong>{user?.name || 'Chef'}</strong> • Manage kitchen orders and menu catalog
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          + Add New Menu Item
        </button>
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
        >
          <div className="glassmorphism" style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Add Dish to Menu</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFood}>
              <div className="form-group">
                <label>Dish Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Truffle Mac & Cheese"
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={foodPrice}
                    onChange={(e) => setFoodPrice(e.target.value)}
                    placeholder="299"
                    required
                  />
                </div>
                <div>
                  <label>Category</label>
                  <select
                    className="form-input"
                    value={foodCategory}
                    onChange={(e) => setFoodCategory(e.target.value)}
                  >
                    <option value="Burgers">Burgers</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Sides">Sides</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Sushi">Sushi</option>
                    <option value="Biryani">Biryani</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                  placeholder="Fresh ingredients, toppings, flavors..."
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={foodImage}
                  onChange={(e) => setFoodImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isVeg"
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--secondary)' }}
                />
                <label htmlFor="isVeg" style={{ margin: 0, cursor: 'pointer', color: '#10B981' }}>
                  Pure Vegetarian
                </label>
              </div>

              <button
                type="submit"
                disabled={addingFood}
                className="btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                {addingFood ? 'Adding...' : 'Save & Publish Dish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Orders Management */}
      <div className="data-table-card glassmorphism" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Kitchen Orders Queue ({orders.length})</h2>
        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No orders currently in the queue.</p>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Items Ordered</th>
                <th>Total</th>
                <th>Current Status</th>
                <th>Action Buttons</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {o._id.substring(o._id.length - 6)}
                  </td>
                  <td>
                    {o.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{o.total}</td>
                  <td>
                    <span className={`status-badge ${o.orderStatus}`}>
                      {o.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {o.orderStatus === 'placed' && (
                        <button
                          onClick={() => handleStatusUpdate(o._id, 'confirmed')}
                          className="btn-small"
                          style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', border: 'none' }}
                        >
                          Confirm
                        </button>
                      )}
                      {(o.orderStatus === 'confirmed' || o.orderStatus === 'placed') && (
                        <button
                          onClick={() => handleStatusUpdate(o._id, 'preparing')}
                          className="btn-small"
                          style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', border: 'none' }}
                        >
                          Cook
                        </button>
                      )}
                      {o.orderStatus === 'preparing' && (
                        <button
                          onClick={() => handleStatusUpdate(o._id, 'ready')}
                          className="btn-small"
                          style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', border: 'none' }}
                        >
                          Mark Ready
                        </button>
                      )}
                      {(o.orderStatus === 'ready' || o.orderStatus === 'preparing') && (
                        <button
                          onClick={() => handleAssignDelivery(o._id)}
                          className="btn-small"
                          style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', border: 'none' }}
                        >
                          Dispatch Rider 🛵
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Menu Items Table */}
      <div className="data-table-card glassmorphism">
        <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Current Menu Items ({foods.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {foods.map((food) => (
            <div
              key={food._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {food.image && (
                <img
                  src={food.image}
                  alt={food.name}
                  style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>{food.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {food.category} • <strong style={{ color: 'var(--primary)' }}>₹{food.price}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
