const express = require('express');
const router = express.Router();
const { logFocusSession, getFocusStats } = require('../controllers/focusController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, logFocusSession);

router.get('/stats', protect, getFocusStats);

module.exports = router;
