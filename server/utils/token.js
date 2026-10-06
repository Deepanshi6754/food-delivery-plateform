// server/utils/token.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate JWT for authenticated user
// Payload includes id, email, role
const signToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  // Token valid for 1 hour
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { signToken };
