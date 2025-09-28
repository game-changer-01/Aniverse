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