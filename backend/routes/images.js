const express = require('express');
const router = express.Router();
const images = require('../controllers/imagesController');

router.get('/search', images.search);

module.exports = router;
