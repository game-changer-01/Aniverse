const Anime = require('../models/Anime');

exports.getAll = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit, 10) || 20));
    const { genre, year, status, search } = req.query;
    const filter = {};
    
    if (genre) filter.genres = { $in: [genre] };
    if (year) filter.year = year;
    if (status) filter.status = status;

    let query = Anime.find(filter).select('-episodes');
    let sort = { createdAt: -1 };
    if (search && search.trim()) {
      // Use text index when available
      query = Anime.find({ ...filter, $text: { $search: search.trim() } })
        .select({ episodes: 0, score: { $meta: 'textScore' } });
      sort = { score: { $meta: 'textScore' } };
    }

    const animes = await query
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Anime.countDocuments(filter);

    res.json({
      animes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const list = await Anime.find({ featured: true }).select('-episodes').limit(12);
    res.json({ anime: list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const list = await Anime.find({ trending: true }).select('-episodes').limit(12);
    res.json({ anime: list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTopPopular = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(500, parseInt(req.query.limit, 10) || 500));
    const list = await Anime.find({}).select('-episodes').sort({ popularity: -1 }).limit(limit);
    res.json({ anime: list, total: list.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    res.json(anime);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEpisodes = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id).select('episodes title');
    if (!anime) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    res.json({ episodes: anime.episodes, title: anime.title });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    
    if (!query.trim()) {
      return res.json([]);
    }

    // Create a case-insensitive regex for flexible matching
    const searchRegex = new RegExp(query.trim().split('').join('.*'), 'i');
    const wordSearchRegex = new RegExp(query.trim().split(/\s+/).join('|'), 'i');
    
    // Search by title with multiple strategies
    const results = await Anime.find({
      $or: [
        { title: { $regex: query.trim(), $options: 'i' } }, // Contains search term
        { title: { $regex: `^${query.trim()}`, $options: 'i' } }, // Starts with
        { title: searchRegex }, // Fuzzy match (letters in order)
        { title_english: { $regex: query.trim(), $options: 'i' } },
        { title_japanese: { $regex: query.trim(), $options: 'i' } },
        { genres: { $regex: wordSearchRegex } }, // Genre match
        { synopsis: { $regex: wordSearchRegex } } // Synopsis match
      ]
    })
    .select('title title_english image mal_id year rating genres type episodes status')
    .limit(limit)
    .lean();

    // Score and sort results by relevance
    const scoredResults = results.map(anime => {
      let score = 0;
      const lowerQuery = query.toLowerCase().trim();
      const lowerTitle = (anime.title || '').toLowerCase();
      
      // Exact match
      if (lowerTitle === lowerQuery) score += 1000;
      
      // Starts with query
      else if (lowerTitle.startsWith(lowerQuery)) score += 500;
      
      // Contains full query
      else if (lowerTitle.includes(lowerQuery)) score += 250;
      
      // Word match
      const queryWords = lowerQuery.split(/\s+/);
      const matchedWords = queryWords.filter(word => lowerTitle.includes(word)).length;
      score += matchedWords * 50;
      
      // Boost by popularity (rating)
      if (anime.rating) score += anime.rating * 10;
      
      return { ...anime, searchScore: score };
    });

    // Sort by search score
    scoredResults.sort((a, b) => b.searchScore - a.searchScore);

    res.json(scoredResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};