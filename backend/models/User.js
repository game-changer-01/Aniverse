const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
  anime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: true
  },
  interactionType: {
    type: String,
    enum: ['view', 'like', 'dislike', 'watch', 'bookmark', 'share', 'rate'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  duration: Number, // time spent viewing/watching in seconds
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const userPreferenceSchema = new mongoose.Schema({
  genres: [{
    name: String,
    weight: {
      type: Number,
      default: 1,
      min: 0,
      max: 5
    }
  }],
  studios: [{
    name: String,
    weight: {
      type: Number,
      default: 1,
      min: 0,
      max: 5
    }
  }],
  yearPreferences: [{
    year: Number,
    weight: {
      type: Number,
      default: 1,
      min: 0,
      max: 5
    }
  }],
  ratingPreference: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 10
    }
  },
  contentType: {
    type: [String],
    enum: ['series', 'movie', 'ova', 'special'],
    default: ['series', 'movie']
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  picture: {
    type: String,
    default: ''
  },
  preferences: {
    type: userPreferenceSchema,
    default: () => ({})
  },
  interactions: [userInteractionSchema],
  watchHistory: [{
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anime'
    },
    episode: Number,
    watchedAt: {
      type: Date,
      default: Date.now
    },
    progress: Number,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  watchlist: [{
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anime'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    }
  }],
  similarUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    similarity: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  recommendationHistory: [{
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anime'
    },
    recommendedAt: {
      type: Date,
      default: Date.now
    },
    algorithm: String,
    score: Number,
    clicked: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  verified: { type: Boolean, default: false },
  premium: { type: Boolean, default: false },
  stripeCustomerId: { type: String, default: '' }
}, {
  timestamps: true
});

// Update lastActive on every save
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);