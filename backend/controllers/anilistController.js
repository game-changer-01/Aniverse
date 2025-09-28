const axios = require('axios');

const GQL_URL = 'https://graphql.anilist.co';
const cache = new Map();
const TTL_MS = 10 * 60 * 1000;

function getCache(key) {
  const v = cache.get(key);
  if (!v) return null;
  if (Date.now() - v.ts > TTL_MS) { cache.delete(key); return null; }
  return v.data;
}
function setCache(key, data) { cache.set(key, { ts: Date.now(), data }); }

async function gql(query, variables) {
  const { data } = await axios.post(GQL_URL, { query, variables }, { timeout: 15000, headers: { 'Content-Type': 'application/json' } });
  return data;
}

exports.search = async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 20));
    if (!q) return res.status(400).json({ error: 'Missing q' });
    const key = `anilist:search:${q}:${page}:${perPage}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);
    const query = `
      query ($q: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(search: $q, type: ANIME) {
            id
            title { romaji english native }
            season
            seasonYear
            episodes
            duration
            averageScore
            popularity
            genres
            studios(isMain: true) { nodes { name } }
            description(asHtml: false)
            coverImage { extraLarge large medium }
            bannerImage
            trailer { id site thumbnail }
          }
        }
      }
    `;
    const resp = await gql(query, { q, page, perPage });
    const media = resp?.data?.Page?.media || [];
    const result = {
      anime: media.map(m => ({
        anilist_id: m.id,
        title: m.title?.english || m.title?.romaji || m.title?.native,
        titles: m.title,
        season: m.season,
        year: m.seasonYear,
        episodes: m.episodes,
        duration: m.duration,
        rating: m.averageScore,
        popularity: m.popularity,
        genres: m.genres,
        studios: (m.studios?.nodes || []).map(s => s.name),
        synopsis: m.description,
        images: { cover: m.coverImage, banner: m.bannerImage },
        trailer: m.trailer,
      })),
      total: media.length,
    };
    setCache(key, result);
    return res.json(result);
  } catch (err) {
    console.error('AniList search error:', err.message);
    return res.status(502).json({ error: 'Failed to search AniList' });
  }
};

exports.getAnime = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const key = `anilist:get:${id}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english native }
          season
          seasonYear
          episodes
          duration
          averageScore
          popularity
          genres
          studios(isMain: true) { nodes { name } }
          description(asHtml: false)
          coverImage { extraLarge large medium }
          bannerImage
          trailer { id site thumbnail }
          relations { edges { relationType node { id type title { romaji english native } } } }
        }
      }
    `;
    const resp = await gql(query, { id });
    const m = resp?.data?.Media;
    if (!m) return res.status(404).json({ error: 'Not found' });
    const result = {
      anilist_id: m.id,
      title: m.title?.english || m.title?.romaji || m.title?.native,
      titles: m.title,
      season: m.season,
      year: m.seasonYear,
      episodes: m.episodes,
      duration: m.duration,
      rating: m.averageScore,
      popularity: m.popularity,
      genres: m.genres,
      studios: (m.studios?.nodes || []).map(s => s.name),
      synopsis: m.description,
      images: { cover: m.coverImage, banner: m.bannerImage },
      trailer: m.trailer,
      relations: m.relations,
    };
    setCache(key, result);
    return res.json(result);
  } catch (err) {
    console.error('AniList getAnime error:', err.message);
    return res.status(502).json({ error: 'Failed to fetch AniList details' });
  }
};
