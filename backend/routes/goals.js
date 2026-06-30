const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoalProgress, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.route('/:id')
  .put(protect, updateGoalProgress)
  .delete(protect, deleteGoal);

module.exports = router;
