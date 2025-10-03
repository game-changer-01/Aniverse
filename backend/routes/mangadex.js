const express = require('express');
const router = express.Router();
const axios = require('axios');

const MANGADEX_API = 'https://api.mangadex.org';

// Search manga with filters
router.get('/search', async (req, res) => {
  try {
    const {
      limit = 24,
      offset = 0,
      title,
      publicationDemographic, // shounen, shoujo, seinen, josei
      contentRating = 'safe', // safe, suggestive, erotica, pornographic
      status, // ongoing, completed, hiatus, cancelled
      originalLanguage, // ja (manga), ko (manhwa), zh (manhua)
      includedTags,
      excludedTags,
      order = 'followedCount' // rating, followedCount, createdAt, updatedAt, latestUploadedChapter
    } = req.query;

    const params = {
      limit,
      offset,
      'contentRating[]': contentRating.split(','),
      'order[followedCount]': 'desc',
      'includes[]': ['cover_art', 'author', 'artist']
    };

    if (title) params.title = title;
    if (publicationDemographic) params['publicationDemographic[]'] = publicationDemographic.split(',');
    if (status) params['status[]'] = status.split(',');
    if (originalLanguage) params['originalLanguage[]'] = originalLanguage.split(',');
    if (includedTags) params['includedTags[]'] = includedTags.split(',');
    if (excludedTags) params['excludedTags[]'] = excludedTags.split(',');

    const response = await axios.get(`${MANGADEX_API}/manga`, { params });
    
    // Transform response to include cover images
    const mangaList = response.data.data.map(manga => {
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      const author = manga.relationships.find(rel => rel.type === 'author');
      const artist = manga.relationships.find(rel => rel.type === 'artist');
      
      return {
        id: manga.id,
        title: manga.attributes.title.en || manga.attributes.title['ja-ro'] || Object.values(manga.attributes.title)[0],
        description: manga.attributes.description.en || Object.values(manga.attributes.description)[0] || '',
        coverUrl: coverArt ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes?.fileName}` : null,
        status: manga.attributes.status,
        year: manga.attributes.year,
        contentRating: manga.attributes.contentRating,
        tags: manga.attributes.tags.map(tag => ({
          id: tag.id,
          name: tag.attributes.name.en
        })),
        author: author?.attributes?.name || 'Unknown',
        artist: artist?.attributes?.name || 'Unknown',
        originalLanguage: manga.attributes.originalLanguage,
        publicationDemographic: manga.attributes.publicationDemographic,
        lastVolume: manga.attributes.lastVolume,
        lastChapter: manga.attributes.lastChapter
      };
    });

    res.json({
      data: mangaList,
      total: response.data.total,
      limit: response.data.limit,
      offset: response.data.offset
    });
  } catch (error) {
    console.error('MangaDex API Error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch manga from MangaDex',
      message: error.message
    });
  }
});

// Get manga by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await axios.get(`${MANGADEX_API}/manga/${id}`, {
      params: {
        'includes[]': ['cover_art', 'author', 'artist', 'tag']
      }
    });

    const manga = response.data.data;
    const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
    const author = manga.relationships.find(rel => rel.type === 'author');
    const artist = manga.relationships.find(rel => rel.type === 'artist');

    const mangaData = {
      id: manga.id,
      title: manga.attributes.title.en || manga.attributes.title['ja-ro'] || Object.values(manga.attributes.title)[0],
      description: manga.attributes.description.en || Object.values(manga.attributes.description)[0] || '',
      coverUrl: coverArt ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes?.fileName}` : null,
      status: manga.attributes.status,
      year: manga.attributes.year,
      contentRating: manga.attributes.contentRating,
      tags: manga.attributes.tags.map(tag => ({
        id: tag.id,
        name: tag.attributes.name.en
      })),
      author: author?.attributes?.name || 'Unknown',
      artist: artist?.attributes?.name || 'Unknown',
      originalLanguage: manga.attributes.originalLanguage,
      publicationDemographic: manga.attributes.publicationDemographic,
      lastVolume: manga.attributes.lastVolume,
      lastChapter: manga.attributes.lastChapter
    };

    res.json(mangaData);
  } catch (error) {
    console.error('MangaDex API Error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch manga details',
      message: error.message
    });
  }
});

// Get manga chapters
router.get('/:id/chapters', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0, translatedLanguage = 'en' } = req.query;

    const response = await axios.get(`${MANGADEX_API}/manga/${id}/feed`, {
      params: {
        limit,
        offset,
        'translatedLanguage[]': translatedLanguage.split(','),
        'order[chapter]': 'asc',
        'includes[]': ['scanlation_group', 'user']
      }
    });

    const chapters = response.data.data.map(chapter => ({
      id: chapter.id,
      chapter: chapter.attributes.chapter,
      title: chapter.attributes.title || `Chapter ${chapter.attributes.chapter}`,
      volume: chapter.attributes.volume,
      pages: chapter.attributes.pages,
      translatedLanguage: chapter.attributes.translatedLanguage,
      publishAt: chapter.attributes.publishAt,
      readableAt: chapter.attributes.readableAt
    }));

    res.json({
      data: chapters,
      total: response.data.total,
      limit: response.data.limit,
      offset: response.data.offset
    });
  } catch (error) {
    console.error('MangaDex API Error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch manga chapters',
      message: error.message
    });
  }
});

// Get popular manga
router.get('/popular/all', async (req, res) => {
  try {
    const { limit = 24, offset = 0 } = req.query;

    const response = await axios.get(`${MANGADEX_API}/manga`, {
      params: {
        limit,
        offset,
        'contentRating[]': ['safe', 'suggestive'],
        'order[followedCount]': 'desc',
        'includes[]': ['cover_art', 'author', 'artist'],
        hasAvailableChapters: true
      }
    });

    const mangaList = response.data.data.map(manga => {
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      const author = manga.relationships.find(rel => rel.type === 'author');

      return {
        id: manga.id,
        title: manga.attributes.title.en || manga.attributes.title['ja-ro'] || Object.values(manga.attributes.title)[0],
        description: manga.attributes.description.en || Object.values(manga.attributes.description)[0] || '',
        coverUrl: coverArt ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes?.fileName}` : null,
        status: manga.attributes.status,
        year: manga.attributes.year,
        contentRating: manga.attributes.contentRating,
        tags: manga.attributes.tags.slice(0, 5).map(tag => ({
          id: tag.id,
          name: tag.attributes.name.en
        })),
        author: author?.attributes?.name || 'Unknown',
        originalLanguage: manga.attributes.originalLanguage,
        publicationDemographic: manga.attributes.publicationDemographic
      };
    });

    res.json({
      data: mangaList,
      total: response.data.total
    });
  } catch (error) {
    console.error('MangaDex API Error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch popular manga',
      message: error.message
    });
  }
});

module.exports = router;
