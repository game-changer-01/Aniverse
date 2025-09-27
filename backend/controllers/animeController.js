const Anime = require('../models/Anime');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, genre, year, status } = req.query;
    const filter = {};
    
    if (genre) filter.genres = { $in: [genre] };
    if (year) filter.year = year;
    if (status) filter.status = status;

    const animes = await Anime.find(filter)
      .select('-episodes')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

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