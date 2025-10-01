const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// Submit feedback
router.post('/', protect, async (req, res) => {
  try {
    const { type, title, description, page, browser, device } = req.body;
    
    const feedback = new Feedback({
      user: req.user.id,
      type,
      title,
      description,
      page,
      browser,
      device
    });

    await feedback.save();
    
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        type: feedback.type,
        title: feedback.title,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's feedback
router.get('/my-feedback', protect, async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('type title description status priority adminResponse createdAt');

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;