// src/hooks/useCart.js
import { useSelector, useDispatch } from 'react-redux';
import { addItem, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon } from '../store/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  return {
    items: cart.items || [],
    subtotal: cart.subtotal || 0,
    deliveryFee: cart.deliveryFee || 0,
    tax: cart.tax || 0,
    discount: cart.discount || 0,
    total: cart.total || 0,
    appliedCoupon: cart.appliedCoupon || null,
    itemCount: (cart.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0),
    addItem: (item) => dispatch(addItem(item)),
    removeItem: (id) => dispatch(removeItem(id)),
    updateQuantity: (id, qty) => dispatch(updateQuantity({ id, quantity: qty })),
    clearCart: () => dispatch(clearCart()),
    applyCoupon: (coupon) => dispatch(applyCoupon(coupon)),
    removeCoupon: () => dispatch(removeCoupon()),
  };
};
