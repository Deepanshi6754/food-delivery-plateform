// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const savedRole = localStorage.getItem('role') || (savedUser ? savedUser.role : null);

const initialState = {
  token: savedToken || null,
  user: savedUser || null,
  role: savedRole || null,
  isAuthenticated: !!savedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user || null;
      state.role = user ? user.role : (action.payload.role || 'customer');
      state.isAuthenticated = true;

      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', state.role);
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
