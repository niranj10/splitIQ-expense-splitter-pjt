// expense-splitter-backend/routes/users.js

const express = require('express');
const { searchUsers } = require('../controllers/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(searchUsers);

module.exports = router;
