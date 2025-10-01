const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Anime = require('../models/Anime');
const Feedback = require('../models/Feedback');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get admin dashboard data
router.get('/overview', protect, adminAuth, async (req, res) => {
  try {
    // Get basic stats
    const totalUsers = await User.countDocuments();
    const totalAnime = await Anime.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    // Get active users (logged in within last 24 hours)
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Get recent users (joined within last 7 days)
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Get open feedback count
    const openFeedback = await Feedback.countDocuments({ status: 'open' });
    
    // Get critical issues
    const criticalIssues = await Feedback.countDocuments({ 
      priority: 'critical', 
      status: { $in: ['open', 'in-progress'] }
    });

    // Get recent feedback
    const recentFeedback = await Feedback.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get anime stats
    const animeStats = await Anime.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user activity by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userActivity = await User.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalAnime,
        totalFeedback,
        totalReviews,
        activeUsers,
        newUsers,
        openFeedback,
        criticalIssues
      },
      recentFeedback,
      animeStats,
      userActivity
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all anime with pagination
router.get('/anime', protect, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const searchQuery = req.query.search || '';
    const statusFilter = req.query.status || '';
    
    let filter = {};
    if (searchQuery) {
      filter.title = { $regex: searchQuery, $options: 'i' };
    }
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const anime = await Anime.find(filter)
      .select('title image status episodes rating popularity createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Anime.countDocuments(filter);

    res.json({
      anime,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching anime list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with pagination
router.get('/users', protect, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const searchQuery = req.query.search || '';
    
    let filter = {};
    if (searchQuery) {
      filter.$or = [
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('username email verified premium isActive lastActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching users list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all feedback with pagination
router.get('/feedback', protect, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const statusFilter = req.query.status || '';
    const typeFilter = req.query.type || '';
    const priorityFilter = req.query.priority || '';
    
    let filter = {};
    if (statusFilter) filter.status = statusFilter;
    if (typeFilter) filter.type = typeFilter;
    if (priorityFilter) filter.priority = priorityFilter;

    const feedback = await Feedback.find(filter)
      .populate('user', 'username email')
      .populate('adminResponse.respondedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(filter);

    res.json({
      feedback,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update feedback status
router.put('/feedback/:id', protect, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminResponse } = req.body;
    
    const updateData = { status, priority };
    
    if (adminResponse) {
      updateData.adminResponse = {
        message: adminResponse,
        respondedBy: req.user.id,
        respondedAt: new Date()
      };
    }
    
    if (status === 'resolved') {
      updateData.resolved = true;
      updateData.resolvedAt = new Date();
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('user', 'username email');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;