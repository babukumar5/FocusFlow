const express = require('express');
const router = express.Router();
const { getHabits, createHabit, toggleHabit, deleteHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getHabits)
  .post(protect, createHabit);

router.route('/:id')
  .put(protect, toggleHabit)
  .delete(protect, deleteHabit);

module.exports = router;
