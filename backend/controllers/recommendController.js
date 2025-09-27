const Anime = require('../models/Anime');
const User = require('../models/User');

// Advanced recommendation algorithms
class RecommendationEngine {
  
  // Content-based filtering using anime features
  static async contentBasedRecommendation(userId, limit = 10) {
    const user = await User.findById(userId).populate('interactions.anime');
    
    if (!user.interactions.length) {
      return this.popularityBasedRecommendation(limit);
    }

    // Calculate user preference vector based on interactions
    const genreWeights = {};
    const studioWeights = {};
    let totalInteractions = 0;

    user.interactions.forEach(interaction => {
      const weight = this.getInteractionWeight(interaction.interactionType);
      const anime = interaction.anime;
      
      if (anime && anime.genres) {
        anime.genres.forEach(genre => {
          genreWeights[genre] = (genreWeights[genre] || 0) + weight;
        });
      }
      
      if (anime && anime.studio) {
        studioWeights[anime.studio] = (studioWeights[anime.studio] || 0) + weight;
      }
      
      totalInteractions += weight;
    });

    // Normalize weights
    Object.keys(genreWeights).forEach(genre => {
      genreWeights[genre] /= totalInteractions;
    });

    // Find anime with similar content
    const watchedAnimeIds = user.interactions.map(i => i.anime._id);
    
    const candidates = await Anime.find({
      _id: { $nin: watchedAnimeIds }
    }).lean();

    // Calculate content similarity scores
    const recommendations = candidates.map(anime => {
      let score = 0;
      
      // Genre similarity
      anime.genres.forEach(genre => {
        score += genreWeights[genre] || 0;
      });
      
      // Studio preference
      if (studioWeights[anime.studio]) {
        score += studioWeights[anime.studio] * 0.3;
      }
      
      // Rating boost
      score += (anime.rating / 10) * 0.2;
      
      // Popularity boost
      score += Math.log(anime.viewCount + 1) * 0.1;

      return { ...anime, recommendationScore: score };
    });

    return recommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  }

  // Collaborative filtering based on similar users
  static async collaborativeFiltering(userId, limit = 10) {
    const currentUser = await User.findById(userId).populate('interactions.anime');
    
    // Find users with similar preferences
    const allUsers = await User.find({ 
      _id: { $ne: userId },
      'interactions.0': { $exists: true }
    }).populate('interactions.anime');

    const similarities = allUsers.map(user => ({
      user: user._id,
      similarity: this.calculateUserSimilarity(currentUser, user)
    })).filter(s => s.similarity > 0.1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50);

    if (similarities.length === 0) {
      return this.contentBasedRecommendation(userId, limit);
    }

    // Get recommendations from similar users
    const watchedAnimeIds = currentUser.interactions.map(i => i.anime._id.toString());
    const recommendations = new Map();

    for (const { user: similarUserId, similarity } of similarities) {
      const similarUser = await User.findById(similarUserId).populate('interactions.anime');
      
      similarUser.interactions.forEach(interaction => {
        const animeId = interaction.anime._id.toString();
        
        if (!watchedAnimeIds.includes(animeId)) {
          const weight = this.getInteractionWeight(interaction.interactionType) * similarity;
          
          if (recommendations.has(animeId)) {
            recommendations.set(animeId, recommendations.get(animeId) + weight);
          } else {
            recommendations.set(animeId, weight);
          }
        }
      });
    }

    // Get top recommended anime
    const sortedRecommendations = Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const animeIds = sortedRecommendations.map(([id]) => id);
    const animes = await Anime.find({ _id: { $in: animeIds } }).lean();

    return animes.map(anime => ({
      ...anime,
      recommendationScore: recommendations.get(anime._id.toString())
    }));
  }

  // Trending/Popular recommendations for new users
  static async popularityBasedRecommendation(limit = 10) {
    return await Anime.find({})
      .sort({ 
        viewCount: -1,
        rating: -1,
        bookmarkCount: -1
      })
      .limit(limit)
      .lean();
  }

  // Hybrid recommendation combining multiple approaches
  static async hybridRecommendation(userId, limit = 20) {
    const [contentBased, collaborative, popular] = await Promise.all([
      this.contentBasedRecommendation(userId, Math.ceil(limit * 0.5)),
      this.collaborativeFiltering(userId, Math.ceil(limit * 0.3)),
      this.popularityBasedRecommendation(Math.ceil(limit * 0.2))
    ]);

    // Combine and deduplicate
    const combined = new Map();
    
    contentBased.forEach((anime, index) => {
      const score = (contentBased.length - index) * 0.5;
      combined.set(anime._id.toString(), { ...anime, hybridScore: score });
    });

    collaborative.forEach((anime, index) => {
      const animeId = anime._id.toString();
      const score = (collaborative.length - index) * 0.3;
      
      if (combined.has(animeId)) {
        combined.get(animeId).hybridScore += score;
      } else {
        combined.set(animeId, { ...anime, hybridScore: score });
      }
    });

    popular.forEach((anime, index) => {
      const animeId = anime._id.toString();
      const score = (popular.length - index) * 0.2;
      
      if (combined.has(animeId)) {
        combined.get(animeId).hybridScore += score;
      } else {
        combined.set(animeId, { ...anime, hybridScore: score });
      }
    });

    return Array.from(combined.values())
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, limit);
  }

  // Calculate similarity between two users based on their interactions
  static calculateUserSimilarity(user1, user2) {
    const user1Animes = new Set(user1.interactions.map(i => i.anime._id.toString()));
    const user2Animes = new Set(user2.interactions.map(i => i.anime._id.toString()));
    
    const intersection = new Set([...user1Animes].filter(x => user2Animes.has(x)));
    const union = new Set([...user1Animes, ...user2Animes]);
    
    if (union.size === 0) return 0;
    
    // Jaccard similarity
    return intersection.size / union.size;
  }

  // Weight different interaction types
  static getInteractionWeight(interactionType) {
    const weights = {
      'view': 1,
      'like': 3,
      'dislike': -2,
      'watch': 5,
      'bookmark': 4,
      'share': 2,
      'rate': 3
    };
    return weights[interactionType] || 1;
  }
}

// Controller methods
exports.recommendForUser = async (req, res) => {
  try {
    const { algorithm = 'hybrid', limit = 20 } = req.query;
    const seedId = req.query.seed || req.query.seedId || '';
    const userId = req.user?.id; // may be undefined for guests

    // If no DB connection (e.g., placeholder password) send static curated list
    if (!User.db?.readyState || User.db.readyState !== 1) {
      return res.json({
        recommendations: getStaticFallbackRecommendations(limit),
        algorithm: 'static-fallback',
        warning: 'Database not connected. Using static fallback list.',
        degraded: true,
        timestamp: new Date()
      });
    }

    // If a seed anime is provided, bias recommendations around it (works for guests and users)
    if (seedId) {
      try {
        const seeded = await getSeededRecommendations(seedId, limit);
        return res.json({
          recommendations: seeded,
          algorithm: 'seeded',
          guest: !userId,
          seed: seedId,
          timestamp: new Date()
        });
      } catch (e) {
        // fall back to normal flow below
      }
    }

    let recommendations;
    let suggestedAlgorithm = algorithm;
    if (userId) {
      try {
        const userDoc = await User.findById(userId).select('interactions');
        const count = userDoc?.interactions?.length || 0;
        if (count < 5) suggestedAlgorithm = 'content';
        else if (count < 20) suggestedAlgorithm = 'hybrid';
        else suggestedAlgorithm = 'collaborative';
      } catch { /* ignore suggestion errors */ }
    } else {
      suggestedAlgorithm = 'popular';
    }
    if (!userId) {
      // Guest user -> popular list only
      recommendations = await RecommendationEngine.popularityBasedRecommendation(limit);
      return res.json({
        recommendations,
        algorithm: 'popular-guest',
        guest: true,
        timestamp: new Date()
      });
    }

    const algoToRun = algorithm || suggestedAlgorithm;
    switch (algoToRun) {
      case 'content':
        recommendations = await RecommendationEngine.contentBasedRecommendation(userId, limit);
        break;
      case 'collaborative':
        recommendations = await RecommendationEngine.collaborativeFiltering(userId, limit);
        break;
      case 'popular':
        recommendations = await RecommendationEngine.popularityBasedRecommendation(limit);
        break;
      case 'hybrid':
      default:
        recommendations = await RecommendationEngine.hybridRecommendation(userId, limit);
        break;
    }

    // Save recommendation history only for authenticated users
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          recommendationHistory: {
            $each: recommendations.map(anime => ({
              anime: anime._id,
              algorithm,
              score: anime.recommendationScore || anime.hybridScore || 0
            }))
          }
        }
      }).catch(() => {}); // ignore write errors for now
    }

    res.json({
      recommendations,
      algorithm: algoToRun,
      guest: !userId,
      suggestedAlgorithm,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    // Last-resort static fallback
    return res.json({
      recommendations: getStaticFallbackRecommendations(10),
      algorithm: 'static-error-fallback',
      error: error.message,
      timestamp: new Date()
    });
  }
};

// Helper: get recommendations seeded from a specific anime (similar by genres/studio/year + popularity/rating boosts)
async function getSeededRecommendations(seedAnimeId, limit = 20) {
  const seed = await Anime.findById(seedAnimeId).lean();
  if (!seed) throw new Error('Seed anime not found');
  const similar = await Anime.find({
    _id: { $ne: seed._id },
    $or: [
      { genres: { $in: seed.genres || [] } },
      seed.studio ? { studio: seed.studio } : {},
      seed.year ? { year: { $gte: (seed.year - 2), $lte: (seed.year + 2) } } : {}
    ]
  })
  .select('-episodes')
  .lean();

  // Score by overlap and popularity
  const seedGenres = new Set(seed.genres || []);
  const scored = similar.map(a => {
    let score = 0;
    (a.genres || []).forEach(g => { if (seedGenres.has(g)) score += 1; });
    if (seed.studio && a.studio === seed.studio) score += 1.5;
    if (typeof seed.year === 'number' && typeof a.year === 'number') {
      const d = Math.abs(a.year - seed.year);
      score += Math.max(0, 1.5 - (d * 0.3));
    }
    score += (a.rating ? (a.rating / 10) : 0) * 0.5;
    score += Math.log((a.viewCount || 0) + 1) * 0.25;
    return { ...a, recommendationScore: score };
  });

  return scored
    .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
    .slice(0, Number(limit) || 20);
}

function getStaticFallbackRecommendations(limit = 10) {
  const sample = [
    { _id: 'static1', title: 'Attack on Titan', poster: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg', year: 2013, genres: ['Action','Drama','Fantasy'], rating: 9.0, description: 'Humanity fights Titans.' },
    { _id: 'static2', title: 'Demon Slayer', poster: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg', year: 2019, genres: ['Action','Supernatural'], rating: 8.7, description: 'Tanjiro seeks a cure for his sister.' },
    { _id: 'static3', title: 'Your Name', poster: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg', year: 2016, genres: ['Romance','Drama','Supernatural'], rating: 8.4, description: 'A mystical body-swapping connection.' },
    { _id: 'static4', title: 'Fullmetal Alchemist: Brotherhood', poster: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg', year: 2009, genres: ['Action','Adventure','Drama'], rating: 9.1, description: 'Two brothers seek the Philosopher\'s Stone.' },
    { _id: 'static5', title: 'Jujutsu Kaisen', poster: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg', year: 2020, genres: ['Action','Supernatural'], rating: 8.6, description: 'Curses and sorcerers collide.' },
    { _id: 'static6', title: 'One Piece', poster: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg', year: 1999, genres: ['Action','Adventure','Comedy'], rating: 9.1, description: 'Luffy sails to become Pirate King.' },
    { _id: 'static7', title: 'Chainsaw Man', poster: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg', year: 2022, genres: ['Action','Horror','Supernatural'], rating: 8.2, description: 'Denji fuses with his chainsaw devil.' },
    { _id: 'static8', title: 'Steins;Gate', poster: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg', year: 2011, genres: ['Sci-Fi','Thriller'], rating: 9.1, description: 'Time travel thriller about choices.' },
    { _id: 'static9', title: 'Spy x Family', poster: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg', year: 2022, genres: ['Comedy','Action','Slice of Life'], rating: 8.5, description: 'A fake family with real bonds.' },
    { _id: 'static10', title: 'Naruto', poster: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg', year: 2002, genres: ['Action','Adventure'], rating: 8.3, description: 'Ninja boy seeks recognition.' }
  ];
  return sample.slice(0, limit).map(a => ({ ...a, hybridScore: a.rating / 10 }));
}

exports.trackInteraction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { animeId, interactionType, rating, duration } = req.body;

    await User.findByIdAndUpdate(userId, {
      $push: {
        interactions: {
          anime: animeId,
          interactionType,
          rating,
          duration,
          timestamp: new Date()
        }
      }
    });

    // Update anime metrics
    const updateData = {};
    
    if (interactionType === 'view') {
      updateData.$inc = { viewCount: 1 };
    } else if (interactionType === 'watch') {
      updateData.$inc = { watchCount: 1 };
    } else if (interactionType === 'bookmark') {
      updateData.$inc = { bookmarkCount: 1 };
    } else if (interactionType === 'share') {
      updateData.$inc = { shareCount: 1 };
    }

    if (Object.keys(updateData).length > 0) {
      await Anime.findByIdAndUpdate(animeId, updateData);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSimilarAnimes = async (req, res) => {
  try {
    const { animeId } = req.params;
    const { limit = 10 } = req.query;

    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    // Find similar anime based on genres, studio, and year
    const similar = await Anime.find({
      _id: { $ne: animeId },
      $or: [
        { genres: { $in: anime.genres } },
        { studio: anime.studio },
        { year: { $gte: anime.year - 2, $lte: anime.year + 2 } }
      ]
    })
    .limit(limit)
    .select('-episodes')
    .lean();

    res.json({ similar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecommendationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const totalRecommendations = user.recommendationHistory.length;
    const clickedRecommendations = user.recommendationHistory.filter(r => r.clicked).length;
    const clickThroughRate = totalRecommendations > 0 ? clickedRecommendations / totalRecommendations : 0;

    // Get genre preferences
    const genreInteractions = {};
    user.interactions.forEach(interaction => {
      if (interaction.anime && interaction.anime.genres) {
        interaction.anime.genres.forEach(genre => {
          genreInteractions[genre] = (genreInteractions[genre] || 0) + 1;
        });
      }
    });

    const topGenres = Object.entries(genreInteractions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    res.json({
      totalRecommendations,
      clickThroughRate,
      topGenres,
      totalInteractions: user.interactions.length,
      watchHistorySize: user.watchHistory.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};