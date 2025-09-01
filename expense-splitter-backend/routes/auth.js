const express = require('express');
// Make sure to import register, login, AND getMe
const { register, login, getMe } = require('../controllers/auth');

// Import the protect middleware
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;