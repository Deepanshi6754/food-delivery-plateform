// src/store/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const normalizeRestId = (r) => {
  if (!r) return '';
  if (typeof r === 'object') {
    return String(r._id || r.id || '');
  }
  return String(r);
};

const savedCart = (() => {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const calculateCartTotals = (items = [], appliedCoupon = null) => {
  const subtotal = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 1), 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const deliveryFee = subtotal > 0 ? (subtotal > 499 ? 0 : 40) : 0;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.type === 'fixed') {
      discount = appliedCoupon.value;
    }
  }
  discount = Number(discount.toFixed(2));
  const total = Number(Math.max(0, subtotal + tax + deliveryFee - discount).toFixed(2));

  return { subtotal, tax, deliveryFee, discount, total };
};

const initialItems = savedCart?.items || [];
const initialCoupon = savedCart?.appliedCoupon || null;
const initialTotals = calculateCartTotals(initialItems, initialCoupon);

const initialState = {
  items: initialItems,
  appliedCoupon: initialCoupon,
  restaurantId: normalizeRestId(savedCart?.restaurantId) || null,
  restaurantName: savedCart?.restaurantName || '',
  ...initialTotals,
};

const saveToLocalStorage = (state) => {
  try {
    localStorage.setItem(
      'cart',
      JSON.stringify({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
      })
    );
  } catch (e) {
    console.warn('Could not save cart to localStorage', e);
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const item = action.payload;
      const incomingRestId = normalizeRestId(item.restaurant);
      const currentRestId = normalizeRestId(state.restaurantId);

      // Only reset if BOTH are defined, non-empty, and genuinely different restaurant IDs
      if (incomingRestId && currentRestId && incomingRestId !== currentRestId) {
        state.items = [];
        state.appliedCoupon = null;
      }

      if (incomingRestId) {
        state.restaurantId = incomingRestId;
      }
      if (item.restaurantName) {
        state.restaurantName = item.restaurantName;
      } else if (item.restaurant && typeof item.restaurant === 'object' && item.restaurant.name) {
        state.restaurantName = item.restaurant.name;
      }

      const key =
        item.cartItemId ||
        `${item._id}${item.selectedVariant ? `_var_${item.selectedVariant.name}` : ''}${
          item.selectedSize ? `_size_${item.selectedSize}` : ''
        }${
          item.selectedAddons && item.selectedAddons.length > 0
            ? `_add_${item.selectedAddons.map((a) => a.name).sort().join('_')}`
            : ''
        }`;

      const price = Number(item.price) || 0;
      const preparedItem = { ...item, price, cartItemId: key };

      const existingIndex = state.items.findIndex(
        (i) =>
          (i.cartItemId && i.cartItemId === key) ||
          String(i._id) === String(item._id)
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += preparedItem.quantity || 1;
      } else {
        state.items.push({ ...preparedItem, quantity: preparedItem.quantity || 1 });
      }

      const totals = calculateCartTotals(state.items, state.appliedCoupon);
      Object.assign(state, totals);
      saveToLocalStorage(state);
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const targetId = String(id);
      if (quantity <= 0) {
        state.items = state.items.filter(
          (i) => (i.cartItemId || String(i._id)) !== targetId && String(i._id) !== targetId
        );
      } else {
        const item = state.items.find(
          (i) => (i.cartItemId || String(i._id)) === targetId || String(i._id) === targetId
        );
        if (item) item.quantity = quantity;
      }

      const totals = calculateCartTotals(state.items, state.appliedCoupon);
      Object.assign(state, totals);
      saveToLocalStorage(state);
    },
    removeItem(state, action) {
      const id = String(action.payload);
      state.items = state.items.filter(
        (i) => (i.cartItemId || String(i._id)) !== id && String(i._id) !== id
      );
      const totals = calculateCartTotals(state.items, state.appliedCoupon);
      Object.assign(state, totals);
      saveToLocalStorage(state);
    },
    applyCoupon(state, action) {
      state.appliedCoupon = action.payload;
      const totals = calculateCartTotals(state.items, state.appliedCoupon);
      Object.assign(state, totals);
      saveToLocalStorage(state);
    },
    removeCoupon(state) {
      state.appliedCoupon = null;
      const totals = calculateCartTotals(state.items, null);
      Object.assign(state, totals);
      saveToLocalStorage(state);
    },
    clearCart(state) {
      state.items = [];
      state.appliedCoupon = null;
      state.restaurantId = null;
      state.restaurantName = '';
      state.subtotal = 0;
      state.tax = 0;
      state.deliveryFee = 0;
      state.discount = 0;
      state.total = 0;
      try {
        localStorage.removeItem('cart');
      } catch (e) {
        console.warn('Could not clear cart in localStorage', e);
      }
    },
  },
});

export const { addItem, updateQuantity, removeItem, applyCoupon, removeCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
