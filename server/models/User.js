// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  title: { type: String, default: 'Home' }, // Home, Work, Other
  street: { type: String, required: true },
  city: { type: String, default: 'New Delhi' },
  state: { type: String, default: 'Delhi' },
  zip: { type: String, default: '110001' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '+91 99999 88888' },
    role: {
      type: String,
      enum: ['customer', 'owner', 'delivery', 'admin'],
      default: 'customer',
    },
    addresses: [addressSchema],
    isVerified: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
