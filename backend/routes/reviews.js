const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');
const Anime = require('../models/Anime');
const { protect } = require('../middleware/auth');

// Submit a review
router.post('/', protect, async (req, res) => {
  try {
    const { animeId, rating, title, content, spoilerWarning } = req.body;
    
    // Check if anime exists
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    // Check if user already reviewed this anime
    const existingReview = await Review.findOne({ 
      user: req.user.id, 
      anime: animeId 
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this anime' });
    }

    const review = new Review({
      user: req.user.id,
      anime: animeId,
      rating,
      title,
      content,
      spoilerWarning
    });

    await review.save();
    
    // Populate user data for response
    await review.populate('user', 'username avatar verified');
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for an anime
router.get('/anime/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'newest'; // newest, oldest, highest, lowest, helpful
    
    let sortOption = {};
    switch (sortBy) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1 };
        break;
      case 'helpful':
        sortOption = { helpfulCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const reviews = await Review.find({ 
      anime: animeId, 
      isHidden: false 
    })
      .populate('user', 'username avatar verified')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ 
      anime: animeId, 
      isHidden: false 
    });

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { anime: mongoose.Types.ObjectId(animeId), isHidden: false } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 0,
      totalReviews: avgRating.length > 0 ? avgRating[0].count : 0
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike a review
router.post('/:reviewId/like', protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already liked this review
    const likeIndex = review.likes.findIndex(like => like.user.toString() === userId);
    
    if (likeIndex > -1) {
      // Remove like
      review.likes.splice(likeIndex, 1);
    } else {
      // Add like and remove dislike if exists
      review.likes.push({ user: userId });
      const dislikeIndex = review.dislikes.findIndex(dislike => dislike.user.toString() === userId);
      if (dislikeIndex > -1) {
        review.dislikes.splice(dislikeIndex, 1);
      }
    }

    await review.save();
    res.json({ 
      likes: review.likes.length, 
      dislikes: review.dislikes.length,
      userLiked: likeIndex === -1,
      userDisliked: false
    });
  } catch (error) {
    console.error('Error liking review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dislike/undislike a review
router.post('/:reviewId/dislike', protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already disliked this review
    const dislikeIndex = review.dislikes.findIndex(dislike => dislike.user.toString() === userId);
    
    if (dislikeIndex > -1) {
      // Remove dislike
      review.dislikes.splice(dislikeIndex, 1);
    } else {
      // Add dislike and remove like if exists
      review.dislikes.push({ user: userId });
      const likeIndex = review.likes.findIndex(like => like.user.toString() === userId);
      if (likeIndex > -1) {
        review.likes.splice(likeIndex, 1);
      }
    }

    await review.save();
    res.json({ 
      likes: review.likes.length, 
      dislikes: review.dislikes.length,
      userLiked: false,
      userDisliked: dislikeIndex === -1
    });
  } catch (error) {
    console.error('Error disliking review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reviews
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('anime', 'title image')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;