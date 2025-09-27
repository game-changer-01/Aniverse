const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const c = require('../controllers/watchController');

// Initiate watch session (start watching)
router.post('/:animeId/start', optionalAuth, c.initiateWatch);

// Get streaming URL for episode
router.get('/:animeId/episode/:episode', optionalAuth, c.getWatchUrl);

// Update watch progress
router.put('/:animeId/episode/:episode/progress', protect, c.updateWatchProgress);

// Get user's watch history
router.get('/history', protect, c.getWatchHistory);

// Get user's watch statistics
router.get('/stats', protect, c.getWatchStats);

module.exports = router;