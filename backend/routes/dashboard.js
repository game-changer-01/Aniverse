const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Anime = require('../models/Anime');
const Feedback = require('../models/Feedback');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// Get user dashboard data
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only access their own dashboard (unless admin)
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(userId)
      .populate('interactions.anime', 'title image genres')
      .populate('watchHistory.anime', 'title image genres episodes')
      .populate('watchlist.anime', 'title image genres')
      .populate('recommendationHistory.anime', 'title image genres')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get visited anime (unique from interactions)
    const visitedAnime = user.interactions
      .filter(interaction => interaction.interactionType === 'view')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20); // Last 20 viewed anime

    // Get user stats
    const stats = {
      totalInteractions: user.interactions.length,
      totalWatched: user.watchHistory.filter(item => item.completed).length,
      totalWatchlist: user.watchlist.length,
      totalRecommendations: user.recommendationHistory.length,
      avgRating: user.interactions
        .filter(i => i.rating)
        .reduce((sum, i) => sum + i.rating, 0) / 
        user.interactions.filter(i => i.rating).length || 0
    };

    // Get recent reviews by this user
    const recentReviews = await Review.find({ user: userId })
      .populate('anime', 'title image')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        verified: user.verified,
        premium: user.premium,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      },
      visitedAnime,
      watchHistory: user.watchHistory.slice(0, 10),
      watchlist: user.watchlist.slice(0, 10),
      stats,
      recentReviews
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, avatar } = req.body;
    
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username, email, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;