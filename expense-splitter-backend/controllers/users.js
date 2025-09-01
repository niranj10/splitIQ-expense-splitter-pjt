// expense-splitter-backend/controllers/users.js

const User = require('../models/User');

// @desc    Search for users by name or email
// @route   GET /api/v1/users
// @access  Private
exports.searchUsers = async (req, res, next) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    // Find users matching the keyword, but exclude the current user from the results
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
