const express = require('express');
const router = express.Router();
const j = require('../controllers/jikanController');

router.get('/top', j.topAnime);
router.get('/search', j.search);
router.get('/anime/:id', j.getAnime);
router.get('/anime/:id/episodes', j.getEpisodes);

module.exports = router;
