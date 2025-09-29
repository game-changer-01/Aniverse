const express = require('express');
const axios = require('axios');
const router = express.Router();

// Lightweight RSS to JSON via rss2json public API or direct RSS parse fallback
// For demo purposes, we’ll fetch a few well-known anime news sources as JSON

async function fetchFeed(url) {
  try {
    const { data } = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`, { timeout: 12000 });
    if (data && data.items) {
      return data.items.map(it => ({
        title: it.title,
        link: it.link,
        pubDate: it.pubDate,
        thumbnail: it.thumbnail || (it.enclosure ? it.enclosure.link : ''),
        description: it.description || '',
        source: data.feed?.title || url,
      }));
    }
  } catch {}
  return [];
}

router.get('/', async (req, res) => {
  try {
    const feeds = [
      'https://www.crunchyroll.com/affiliate-rss',
      'https://www.animenewsnetwork.com/all/rss.xml',
      'https://www.animenewsnetwork.com/news/rss.xml?ann-edition=us',
    ];
    const results = await Promise.all(feeds.map(fetchFeed));
    const merged = results.flat().sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 40);
    res.json({ articles: merged, updated: new Date() });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch news', details: e.message });
  }
});

module.exports = router;
