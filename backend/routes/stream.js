const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/streamController');

router.get('/:animeId/episode/:episodeNum', protect, c.getStreamUrl);

module.exports = router;