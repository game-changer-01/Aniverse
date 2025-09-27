const Anime = require('../models/Anime');
const User = require('../models/User');

exports.initiateWatch = async (req, res) => {
  try {
    const { animeId } = req.params;
    const { episode = 1, redirectUrl } = req.body;
    const userId = req.user?.id;

    // Verify anime exists
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    // Check if episode exists
    const episodeData = anime.episodes.find(ep => ep.number === parseInt(episode));
    if (!episodeData) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // Track interaction if user is logged in
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          interactions: {
            anime: animeId,
            interactionType: 'watch',
            timestamp: new Date()
          },
          watchHistory: {
            anime: animeId,
            episode: parseInt(episode),
            watchedAt: new Date(),
            progress: 0
          }
        }
      });

      // Update recommendation click if this came from recommendations
      await User.findOneAndUpdate(
        { 
          _id: userId,
          'recommendationHistory.anime': animeId
        },
        {
          $set: { 'recommendationHistory.$.clicked': true }
        }
      );
    }

    // Update anime metrics
    await Anime.findByIdAndUpdate(animeId, {
      $inc: { 
        viewCount: 1,
        watchCount: 1,
        'episodes.$[elem].watchCount': 1
      }
    }, {
      arrayFilters: [{ 'elem.number': parseInt(episode) }]
    });

    // Generate secure watch session
    const watchSession = {
      sessionId: generateSessionId(),
      animeId,
      episode: parseInt(episode),
      userId: userId || null,
      startTime: new Date(),
      streamUrl: episodeData.streamUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    // In production, you'd store this in Redis or a session store
    // For now, we'll include it in the response

    res.json({
      success: true,
      watchSession,
      anime: {
        id: anime._id,
        title: anime.title,
        poster: anime.poster,
        totalEpisodes: anime.totalEpisodes
      },
      episode: {
        number: episodeData.number,
        title: episodeData.title,
        duration: episodeData.duration,
        thumbnail: episodeData.thumbnail
      },
      redirectUrl: redirectUrl || `/watch/${animeId}/${episode}`,
      message: 'Watch session initiated successfully'
    });

  } catch (error) {
    console.error('Watch initiation error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getWatchUrl = async (req, res) => {
  try {
    const { animeId, episode } = req.params;
    const { sessionId } = req.query;
    const userId = req.user?.id;

    // Verify anime and episode
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    const episodeData = anime.episodes.find(ep => ep.number === parseInt(episode));
    if (!episodeData) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // In production, verify sessionId from session store
    if (!sessionId) {
      return res.status(401).json({ error: 'Valid session required' });
    }

    // Generate time-limited signed URL for streaming
    const signedUrl = generateSignedStreamUrl(episodeData.streamUrl, sessionId);

    res.json({
      streamUrl: signedUrl,
      anime: {
        id: anime._id,
        title: anime.title,
        description: anime.description,
        poster: anime.poster,
        totalEpisodes: anime.totalEpisodes,
        genres: anime.genres,
        rating: anime.rating
      },
      episode: {
        number: episodeData.number,
        title: episodeData.title,
        duration: episodeData.duration,
        thumbnail: episodeData.thumbnail
      },
      nextEpisode: anime.episodes.find(ep => ep.number === parseInt(episode) + 1) || null,
      prevEpisode: anime.episodes.find(ep => ep.number === parseInt(episode) - 1) || null
    });

  } catch (error) {
    console.error('Watch URL error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateWatchProgress = async (req, res) => {
  try {
    const { animeId, episode } = req.params;
    const { progress, completed = false } = req.body;
    const userId = req.user.id;

    // Update user's watch progress
    await User.findOneAndUpdate(
      { 
        _id: userId,
        'watchHistory.anime': animeId,
        'watchHistory.episode': parseInt(episode)
      },
      {
        $set: {
          'watchHistory.$.progress': progress,
          'watchHistory.$.completed': completed,
          'watchHistory.$.lastWatched': new Date()
        }
      },
      { upsert: false }
    );

    // If completed, add to interactions
    if (completed) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          interactions: {
            anime: animeId,
            interactionType: 'watch',
            duration: progress,
            timestamp: new Date()
          }
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'watchHistory.anime',
        select: 'title poster totalEpisodes rating genres'
      })
      .lean();

    const watchHistory = user.watchHistory
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
      .slice((page - 1) * limit, page * limit);

    res.json({ 
      watchHistory,
      hasMore: user.watchHistory.length > page * limit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWatchStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate('watchHistory.anime');
    
    const totalWatched = user.watchHistory.length;
    const completedAnimes = user.watchHistory.filter(w => w.completed).length;
    const totalWatchTime = user.interactions
      .filter(i => i.interactionType === 'watch' && i.duration)
      .reduce((sum, i) => sum + i.duration, 0);

    // Calculate favorite genres based on watch history
    const genreCounts = {};
    user.watchHistory.forEach(history => {
      if (history.anime && history.anime.genres) {
        history.anime.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    const favoriteGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    res.json({
      totalWatched,
      completedAnimes,
      totalWatchTime: Math.round(totalWatchTime / 60), // in minutes
      favoriteGenres,
      averageRating: user.interactions
        .filter(i => i.rating)
        .reduce((sum, i, _, arr) => sum + i.rating / arr.length, 0) || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
function generateSessionId() {
  return require('crypto').randomBytes(32).toString('hex');
}

function generateSignedStreamUrl(baseUrl, sessionId) {
  // In production, this would generate a time-limited signed URL
  // For now, we'll return the base URL with session info
  const url = new URL(baseUrl);
  url.searchParams.set('session', sessionId);
  url.searchParams.set('expires', Date.now() + (60 * 60 * 1000)); // 1 hour
  return url.toString();
}

module.exports = {
  initiateWatch: exports.initiateWatch,
  getWatchUrl: exports.getWatchUrl,
  updateWatchProgress: exports.updateWatchProgress,
  getWatchHistory: exports.getWatchHistory,
  getWatchStats: exports.getWatchStats
};