// src/socket.js
import { io } from 'socket.io-client';

// Use same host if running behind Vite proxy or fall back to port 5000
const SOCKET_URL = window.location.port === '5173' ? '' : 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  timeout: 5000,
});

