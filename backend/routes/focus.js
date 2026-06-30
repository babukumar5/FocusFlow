const express = require('express');
const router = express.Router();
const { createFocusSession, getFocusHistory, deleteFocusSession, getFocusStats } = require('../controllers/focusController');
const { protect } = require('../middleware/auth');

router.post('/session', protect, createFocusSession);
router.get('/history', protect, getFocusHistory);
router.delete('/session/:id', protect, deleteFocusSession);
router.get('/stats', protect, getFocusStats);

module.exports = router;
