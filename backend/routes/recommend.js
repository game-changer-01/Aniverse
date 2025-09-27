const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const c = require('../controllers/recommendController');

// Get personalized or guest recommendations (optional auth)
// Accept optional seedId to bias recs around a specific anime
router.get('/', optionalAuth, (req, res, next) => {
  if (req.query.seedId && !req.query.seed) req.query.seed = req.query.seedId;
  next();
}, c.recommendForUser);

// Track user interactions for better recommendations
router.post('/interact', optionalAuth, c.trackInteraction);

// Get similar anime based on specific anime
router.get('/similar/:animeId', c.getSimilarAnimes);

// Get recommendation statistics for user
router.get('/stats', protect, c.getRecommendationStats);

module.exports = router;