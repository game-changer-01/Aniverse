const express = require('express');
const router = express.Router();
const c = require('../controllers/animeController');

router.get('/', c.getAll);
router.get('/featured', c.getFeatured);
router.get('/trending', c.getTrending);
router.get('/:id', c.getOne);
router.get('/:id/episodes', c.getEpisodes);

module.exports = router;