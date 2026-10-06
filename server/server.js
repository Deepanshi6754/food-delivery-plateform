// server/server.js
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan('dev'));

// Simple health check route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Food Delivery Backend is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const restaurantRoutes = require('./routes/restaurants');
const foodRoutes = require('./routes/foods');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const webhookRoutes = require('./routes/webhook');
const deliveryPartnerRoutes = require('./routes/deliveryPartner');
const reviewRoutes = require('./routes/review');
const adminRoutes = require('./routes/admin');
const seedRoutes = require('./routes/seed');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/delivery', deliveryPartnerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seed', seedRoutes);

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('⚡ Socket client connected:', socket.id);

  socket.on('joinOrderRoom', (orderId) => {
    if (orderId) {
      socket.join(orderId.toString());
      console.log(`Socket ${socket.id} joined order room: ${orderId}`);
    }
  });

  socket.on('leaveOrderRoom', (orderId) => {
    if (orderId) {
      socket.leave(orderId.toString());
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Express global error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err.message || err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack,
  });
});

// Process-level resilience
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Connect to MongoDB and start server
const startServer = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodDelivery';
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully to:', mongoUri);
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    // Don't crash immediately in dev, retry or keep server alive
    setTimeout(startServer, 5000);
  }
};

startServer();
