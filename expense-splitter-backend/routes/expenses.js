const express = require('express');
const { addExpense, getExpensesForGroup } = require('../controllers/expenses'); // Import getExpensesForGroup
const { protect } = require('../middleware/auth');


// We need to merge params to access groupId from the groups router
const router = express.Router({ mergeParams: true }); 

router.use(protect);

router.route('/')
    .post(addExpense)
    .get(getExpensesForGroup); // Add the GET handler here

module.exports = router;