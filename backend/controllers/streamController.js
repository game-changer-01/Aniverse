const Anime = require('../models/Anime');

exports.getStreamUrl = async (req, res) => {
  try {
    const { animeId, episodeNum } = req.params;
    
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    const episode = anime.episodes.find(ep => ep.number === parseInt(episodeNum));
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // In a real app, this would generate a signed URL or check user permissions
    res.json({
      streamUrl: episode.streamUrl,
      title: episode.title,
      number: episode.number,
      duration: episode.duration
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};