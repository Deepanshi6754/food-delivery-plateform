// server/routes/user.js
const express = require('express');
const { getAddresses, addAddress, getAllUsers, updateProfile } = require('../controllers/userController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.get('/', authorize(['admin']), getAllUsers);

module.exports = router;

