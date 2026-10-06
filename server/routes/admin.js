// server/routes/admin.js
const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { getStats } = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize(['admin']));

router.get('/stats', getStats);

module.exports = router;
