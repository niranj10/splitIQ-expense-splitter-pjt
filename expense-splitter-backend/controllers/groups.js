// expense-splitter-backend/controllers/groups.js

const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');

// @desc    Create a group
// @route   POST /api/v1/groups
// @access  Private
exports.createGroup = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    req.body.members = [req.user.id];
    const group = await Group.create(req.body);
    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all groups for a user
// @route   GET /api/v1/groups
// @access  Private
exports.getGroups = async (req, res, next) => {
    try {
        const groups = await Group.find({ members: req.user.id }).populate({
            path: 'members',
            select: 'name email avatar'
        });
        res.status(200).json({
            success: true,
            count: groups.length,
            data: groups,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get single group
// @route   GET /api/v1/groups/:id
// @access  Private
exports.getGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id).populate({
            path: 'members',
            select: 'name email avatar'
        });

        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        if (!group.members.some(member => member._id.equals(req.user.id))) {
            return res.status(403).json({ success: false, error: 'You are not authorized to access this group' });
        }

        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


// @desc    Add a member to a group
// @route   POST /api/v1/groups/:groupId/members
// @access  Private
exports.addMember = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) { return res.status(404).json({ success: false, error: 'Group not found' }); }
        if (!group.members.includes(req.user.id)) { return res.status(403).json({ success: false, error: 'You are not a member of this group' });}
        const { userId } = req.body;
        if (!group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();
        }
        // Repopulate members to send back full details
        const updatedGroup = await Group.findById(req.params.groupId).populate('members', 'name email avatar');
        res.status(200).json({ success: true, data: updatedGroup });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Remove a member from a group
// @route   DELETE /api/v1/groups/:groupId/members/:memberId
// @access  Private
exports.removeMember = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) { return res.status(404).json({ success: false, error: 'Group not found' }); }
        if (group.createdBy.toString() !== req.user.id) { return res.status(403).json({ success: false, error: 'Only the group creator can remove members' }); }
        if (req.params.memberId === group.createdBy.toString()) { return res.status(400).json({ success: false, error: 'The group creator cannot be removed' }); }
        group.members.pull(req.params.memberId);
        await group.save();
        res.status(200).json({ success: true, data: group });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get balances for a group
// @route   GET /api/v1/groups/:groupId/balances
// @access  Private
exports.getGroupBalances = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId).populate('members', 'name email');
        if (!group) { return res.status(404).json({ success: false, error: 'Group not found' }); }
        if (!group.members.some(member => member._id.equals(req.user.id))) { return res.status(403).json({ success: false, error: 'You are not a member of this group' }); }
        const expenses = await Expense.find({ group: req.params.groupId });
        const balances = new Map();
        group.members.forEach(member => {
            balances.set(member._id.toString(), { name: member.name, email: member.email, balance: 0 });
        });
        expenses.forEach(expense => {
            const payerId = expense.paidBy.toString();
            if (balances.has(payerId)) {
                balances.get(payerId).balance += expense.amount;
            }
            expense.split_details.forEach(detail => {
                const owerId = detail.user.toString();
                if (balances.has(owerId)) {
                    balances.get(owerId).balance -= detail.owes;
                }
            });
        });
        const balancesArray = Array.from(balances.values());
        res.status(200).json({
            success: true,
            data: balancesArray,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Add this function to expense-splitter-backend/controllers/groups.js

// @desc    Delete a group
// @route   DELETE /api/v1/groups/:id
// @access  Private
exports.deleteGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        // Make sure user is the group creator
        if (group.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'User not authorized to delete this group' });
        }

        // We should also delete all expenses associated with this group
        await Expense.deleteMany({ group: req.params.id });
        
        await group.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
