const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: true,
  },
  paidBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  split_method: {
    type: String,
    enum: ['equally', 'shares', 'exact'],
    required: true,
  },
  // Details of how the expense is split among members
  split_details: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      // For 'equally', this is calculated. For 'exact' or 'shares', it's provided.
      owes: {
        type: Number,
        required: true,
      },
      share: { // Only for 'shares' method
        type: Number,
      }
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Expense', ExpenseSchema);