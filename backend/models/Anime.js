const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  streamUrl: { type: String, required: true },
  thumbnail: String,
  watchCount: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 }
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  review: String,
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const animeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  alternativeTitles: [String],
  description: { type: String, required: true },
  poster: { type: String, required: true },
  banner: String,
  trailer: String,
  year: { type: Number, required: true },
  season: {
    type: String,
    enum: ['Spring', 'Summer', 'Fall', 'Winter']
  },
  status: { 
    type: String, 
    enum: ['Ongoing', 'Completed', 'Upcoming'], 
    default: 'Ongoing' 
  },
  type: {
    type: String,
    enum: ['TV', 'Movie', 'OVA', 'ONA', 'Special'],
    default: 'TV'
  },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  popularity: { type: Number, default: 0 },
  genres: [{ type: String, required: true }],
  tags: [String],
  studio: String,
  director: String,
  source: String,
  totalEpisodes: { type: Number, default: 0 },
  duration: Number, // average episode duration
  episodes: [episodeSchema],
  reviews: [reviewSchema],
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  
  // Recommendation metadata
  similarAnimes: [{
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anime'
    },
    similarity: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  viewCount: { type: Number, default: 0 },
  watchCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  
  // ML features for recommendation
  features: {
    genreVector: [Number],
    popularityScore: { type: Number, default: 0 },
    qualityScore: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Create text index for search
animeSchema.index({ title: 'text', description: 'text', genres: 'text' });

module.exports = mongoose.model('Anime', animeSchema);