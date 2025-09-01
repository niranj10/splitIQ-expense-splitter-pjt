// Update this file: expense-splitter-backend/routes/groups.js

const express = require('express');
const { 
    createGroup, 
    getGroups, 
    addMember, 
    removeMember, 
    getGroupBalances,
    getGroup,
    deleteGroup // Import deleteGroup
} = require('../controllers/groups');
const { protect } = require('../middleware/auth');
const expenseRouter = require('./expenses');

const router = express.Router();

router.use(protect);

router.use('/:groupId/expenses', expenseRouter);

router.route('/')
  .post(createGroup)
  .get(getGroups);

router.route('/:id')
    .get(getGroup)
    .delete(deleteGroup); // Add delete route

router.route('/:groupId/balances').get(getGroupBalances);
router.route('/:groupId/members').post(addMember);
router.route('/:groupId/members/:memberId').delete(removeMember);

module.exports = router;
