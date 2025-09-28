const axios = require('axios');

// Simple in-memory cache
const cache = new Map(); // key -> { ts, data }
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

exports.topAnime = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(500, parseInt(req.query.limit, 10) || 50));
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const key = `top:${page}:${limit}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);

    const url = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=${Math.min(limit, 25)}`;
    const { data } = await axios.get(url, { timeout: 12000 });
    // Jikan pages return up to 25 per page; if limit > 25, fetch more pages
    let items = data.data || [];
    let remaining = limit - items.length;
    let nextPage = page + 1;
    while (remaining > 0 && data.pagination?.has_next_page) {
      const more = await axios.get(`https://api.jikan.moe/v4/top/anime?page=${nextPage}&limit=${Math.min(remaining, 25)}`, { timeout: 12000 });
      items = items.concat(more.data?.data || []);
      remaining = limit - items.length;
      if (!(more.data?.pagination?.has_next_page)) break;
      nextPage += 1;
    }
    const result = {
      anime: items.map(a => ({
        mal_id: a.mal_id,
        title: a.titles?.[0]?.title || a.title,
        titles: a.titles,
        images: a.images,
        episodes: a.episodes,
        duration: a.duration,
        rating: a.score,
        year: a.year,
        genres: (a.genres || []).map(g => g.name),
        studios: (a.studios || []).map(s => s.name),
        synopsis: a.synopsis,
        type: a.type,
        popularity: a.popularity,
      })),
      total: items.length,
    };
    setCache(key, result);
    return res.json(result);
  } catch (err) {
    console.error('Jikan top error:', err.message);
    return res.status(502).json({ error: 'Failed to fetch top anime from Jikan' });
  }
};

exports.getAnime = async (req, res) => {
  try {
    const { id } = req.params;
    const key = `anime:${id}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);
    const { data } = await axios.get(`https://api.jikan.moe/v4/anime/${id}/full`, { timeout: 12000 });
    const a = data?.data;
    if (!a) return res.status(404).json({ error: 'Anime not found' });
    const result = {
      mal_id: a.mal_id,
      title: a.titles?.[0]?.title || a.title,
      titles: a.titles,
      images: a.images,
      episodes: a.episodes,
      duration: a.duration,
      rating: a.score,
      year: a.year,
      season: a.season,
      broadcast: a.broadcast,
      genres: (a.genres || []).map(g => g.name),
      studios: (a.studios || []).map(s => s.name),
      synopsis: a.synopsis,
      type: a.type,
      popularity: a.popularity,
      trailer: a.trailer,
      relations: a.relations,
    };
    setCache(key, result);
    return res.json(result);
  } catch (err) {
    console.error('Jikan getAnime error:', err.message);
    return res.status(502).json({ error: 'Failed to fetch anime details from Jikan' });
  }
};

exports.getEpisodes = async (req, res) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 100));
    const key = `eps:${id}:${page}:${pageSize}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);
    const url = `https://api.jikan.moe/v4/anime/${id}/episodes?page=${page}&limit=${pageSize}`;
    const { data } = await axios.get(url, { timeout: 12000 });
    const pageStart = (page - 1) * pageSize;
    const items = (data?.data || []).map((ep, idx) => ({
      mal_id: ep.mal_id,
      number: pageStart + idx + 1,
      title: ep.title || ep.title_romanji || ep.title_japanese,
      title_japanese: ep.title_japanese,
      title_romanji: ep.title_romanji,
      aired: ep.aired,
      filler: ep.filler,
      recap: ep.recap,
      forum_url: ep.forum_url,
    }));
    const result = {
      episodes: items,
      pagination: data?.pagination,
    };
    setCache(key, result);
    return res.json(result);
  } catch (err) {
    console.error('Jikan episodes error:', err.message);
    return res.status(502).json({ error: 'Failed to fetch episodes from Jikan' });
  }
};

exports.search = async (req, res) => {
  try {
    const q = (req.query.q || req.query.query || '').toString().trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 24));
    if (!q) return res.status(400).json({ error: 'Missing q' });
    const key = `search:${q}:${page}:${limit}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&page=${page}&limit=${Math.min(limit, 25)}`;
    const { data } = await axios.get(url, { timeout: 12000 });
    let items = data?.data || [];
    const result = {
      anime: items.map(a => ({
        mal_id: a.mal_id,
        title: a.titles?.[0]?.title || a.title,
        titles: a.titles,
        images: a.images,
        episodes: a.episodes,
        duration: a.duration,
        rating: a.score,
        year: a.year,
        genres: (a.genres || []).map(g => g.name),
        studios: (a.studios || []).map(s => s.name),
        synopsis: a.synopsis,
        type: a.type,
        popularity: a.popularity,
      })),
      total: items.length,
    };
    setCache(key, result);
    return res.json(result);
  } catch (err) {
    console.error('Jikan search error:', err.message);
    return res.status(502).json({ error: 'Failed to search anime from Jikan' });
  }
};
