const express = require('express');
const router = express.Router();
const a = require('../controllers/anilistController');

router.get('/search', a.search);
router.get('/anime/:id', a.getAnime);

module.exports = router;
