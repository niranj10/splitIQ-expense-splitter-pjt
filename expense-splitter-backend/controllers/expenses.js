const Expense = require('../models/Expense');
const Group = require('../models/Group');

// @desc    Add an expense to a group
// @route   POST /api/v1/expenses
// @access  Private
exports.addExpense = async (req, res, next) => {
  try {
    const { description, amount, group, paidBy, split_method, split_details } = req.body;

    // Basic validation
    if (!description || !amount || !group || !paidBy || !split_method) {
        return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const groupExists = await Group.findById(group);
    if (!groupExists) {
        return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Ensure the user adding the expense and the user who paid are members of the group
    if (!groupExists.members.includes(req.user.id) || !groupExists.members.includes(paidBy)) {
        return res.status(403).json({ success: false, error: 'Payer or current user is not a member of this group' });
    }

    let processedSplitDetails = [];

    // --- Handle 'equally' split method ---
    if (split_method === 'equally') {
      const membersCount = groupExists.members.length;
      const amountPerMember = parseFloat((amount / membersCount).toFixed(2));
      
      processedSplitDetails = groupExists.members.map(memberId => ({
        user: memberId,
        owes: amountPerMember,
      }));
    } else {
        // For 'exact' or 'shares', the frontend will send the split_details
        // We should add validation here to ensure the total 'owes' amount matches the expense amount
        const totalOwed = split_details.reduce((acc, detail) => acc + detail.owes, 0);
        if (totalOwed !== amount) {
            return res.status(400).json({ success: false, error: 'The sum of what is owed does not match the total expense amount.' });
        }
        processedSplitDetails = split_details;
    }

    const expense = await Expense.create({
        description,
        amount,
        group,
        paidBy,
        split_method,
        split_details: processedSplitDetails
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all expenses for a group
// @route   GET /api/v1/groups/:groupId/expenses
// @access  Private
exports.getExpensesForGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        // Ensure user is a member of the group
        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ success: false, error: 'You are not a member of this group' });
        }

        const expenses = await Expense.find({ group: req.params.groupId })
            .populate('paidBy', 'name email')
            .populate('split_details.user', 'name email');

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};