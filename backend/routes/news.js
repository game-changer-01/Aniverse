const express = require('express');
const axios = require('axios');
const router = express.Router();

const cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10 * 60 * 1000;

async function fetchMALNews() {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/news', { timeout: 12000 });
    if (response.data && response.data.data) {
      return response.data.data.map(item => ({
        mal_id: item.mal_id,
        title: item.title,
        link: item.url,
        pubDate: item.date,
        thumbnail: item.images?.jpg?.image_url || '',
        description: item.excerpt || '',
        author: item.author_username,
        source: 'MyAnimeList News',
      }));
    }
  } catch (error) {
    console.error('Failed to fetch MAL news:', error.message);
  }
  return [];
}

async function fetchANNNews() {
  try {
    const annUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.animenewsnetwork.com/all/rss.xml');
    const response = await axios.get(annUrl, { timeout: 12000 });
    if (response.data && response.data.items) {
      return response.data.items.slice(0, 20).map((it, idx) => ({
        mal_id: 'ann-' + idx + '-' + Date.now(),
        title: it.title,
        link: it.link,
        pubDate: it.pubDate,
        thumbnail: it.thumbnail || (it.enclosure ? it.enclosure.link : ''),
        description: it.description || it.content || '',
        source: 'Anime News Network',
      }));
    }
  } catch (error) {
    console.error('Failed to fetch ANN news:', error.message);
  }
  return [];
}

async function fetchCrunchyrollNews() {
  try {
    const crUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.crunchyroll.com/affiliate-rss');
    const response = await axios.get(crUrl, { timeout: 12000 });
    if (response.data && response.data.items) {
      return response.data.items.slice(0, 15).map((it, idx) => ({
        mal_id: 'cr-' + idx + '-' + Date.now(),
        title: it.title,
        link: it.link,
        pubDate: it.pubDate,
        thumbnail: it.thumbnail || (it.enclosure ? it.enclosure.link : ''),
        description: it.description || '',
        source: 'Crunchyroll',
      }));
    }
  } catch (error) {
    console.error('Failed to fetch Crunchyroll news:', error.message);
  }
  return [];
}

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
      return res.json(cache.data);
    }
    console.log('Fetching anime news from multiple sources...');
    const results = await Promise.all([
      fetchMALNews(),
      fetchANNNews(),
      fetchCrunchyrollNews(),
    ]);
    const malNews = results[0];
    const annNews = results[1];
    const crNews = results[2];
    const allNews = [...malNews, ...annNews, ...crNews];
    const sorted = allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const result = {
      articles: sorted,
      updated: new Date(),
      sources: {
        mal: malNews.length,
        ann: annNews.length,
        crunchyroll: crNews.length,
      },
      total: sorted.length,
    };
    cache.data = result;
    cache.timestamp = now;
    res.json(result);
  } catch (e) {
    console.error('News fetch error:', e.message);
    res.status(500).json({ error: 'Failed to fetch news', details: e.message });
  }
});

module.exports = router;
