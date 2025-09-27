const express = require('express');
const router = express.Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', c.register);
router.post('/login', c.login);
router.post('/google', c.googleLogin);
router.get('/me', protect, c.getMe);

module.exports = router;