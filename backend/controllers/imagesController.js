const axios = require('axios');

// Simple in-memory cache to reduce API calls
const cache = new Map(); // key -> { ts, data }
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

exports.search = async (req, res) => {
  try {
    const q = (req.query.q || req.query.query || '').toString().trim();
    if (!q) return res.status(400).json({ error: 'Missing query' });

    const key = process.env.GOOGLE_CSE_KEY;
    const cx = process.env.GOOGLE_CSE_CX;
    const rights = process.env.GOOGLE_CSE_RIGHTS; // e.g. cc_publicdomain|cc_attribute
    if (!key || !cx) return res.status(500).json({ error: 'Image search not configured' });

    const cacheKey = JSON.stringify({ q, rights });
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.ts) < TTL_MS) {
      return res.json(cached.data);
    }

    const params = new URLSearchParams({
      key,
      cx,
      q: q,
      searchType: 'image',
      safe: 'active',
      num: '5',
    });
    if (rights) params.set('rights', rights);

    const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    const items = (data.items || []).map(i => ({
      url: i.link,
      contextLink: i.image?.contextLink || i.image?.contextLink,
      mime: i.mime,
      width: i.image?.width,
      height: i.image?.height,
      thumbnailLink: i.image?.thumbnailLink,
    }));

    const result = { items };
    cache.set(cacheKey, { ts: now, data: result });
    return res.json(result);
  } catch (err) {
    console.error('Image search error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Search failed' });
  }
};
