const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendAdminNotification } = require('../services/emailService');

// Admin route to manually verify users
router.post('/verify/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { verified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId, 
      { verified: verified !== false }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all unverified users
router.get('/unverified', async (req, res) => {
  try {
    const unverifiedUsers = await User.find({ verified: false })
      .select('username email createdAt picture avatar')
      .sort({ createdAt: -1 });
    
    res.json(unverifiedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('username email verified premium createdAt lastActive picture avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalUsers = await User.countDocuments();
    
    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;