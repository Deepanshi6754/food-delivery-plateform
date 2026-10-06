// server/routes/seed.js
const express = require('express');
const { seedDatabase } = require('../controllers/seedController');

const router = express.Router();

const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Seeding is disabled in production.' });
  }
  next();
};

router.post('/', devOnly, seedDatabase);
router.get('/', devOnly, seedDatabase); // support GET for convenient 1-click seeding

module.exports = router;
