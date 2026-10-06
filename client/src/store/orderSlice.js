// src/store/orderSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeOrder: null,
  orderHistory: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setActiveOrder(state, action) {
      state.activeOrder = action.payload;
    },
    updateOrderStatus(state, action) {
      if (state.activeOrder && state.activeOrder._id === action.payload.orderId) {
        state.activeOrder.orderStatus = action.payload.status;
      }
    },
    setOrderHistory(state, action) {
      state.orderHistory = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setActiveOrder, updateOrderStatus, setOrderHistory, setLoading, setError } = orderSlice.actions;
export default orderSlice.reducer;
