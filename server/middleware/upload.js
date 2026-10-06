// server/middleware/upload.js
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'food-delivery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// Multer instance
const parser = multer({ storage });

module.exports = parser;
