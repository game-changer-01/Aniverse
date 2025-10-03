import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';

const SmartSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  // Conditional router - only use on client-side
  const router = typeof window !== 'undefined' ? useRouter() : null;
  const debounceTimer = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aniverse_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Save search to recent
  const saveToRecent = (anime) => {
    const updated = [
      { id: anime.mal_id || anime._id, title: anime.title, image: anime.image },
      ...recentSearches.filter(item => item.id !== (anime.mal_id || anime._id))
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('aniverse_recent_searches', JSON.stringify(updated));
  };

  // Enhanced fuzzy search implementation
  const fuzzyMatch = (str, pattern) => {
    const strLower = str.toLowerCase().trim();
    const patternLower = pattern.toLowerCase().trim();
    
    // Empty pattern
    if (!patternLower) return 0;
    
    // Exact match gets highest priority
    if (strLower === patternLower) return 10000;
    
    // Contains full search term
    if (strLower.includes(patternLower)) return 5000;
    
    // Check if pattern words are in title
    const patternWords = patternLower.split(/\s+/);
    const matchedWords = patternWords.filter(word => 
      strLower.includes(word)
    ).length;
    
    if (matchedWords > 0) {
      return 1000 + (matchedWords * 500);
    }
    
    // Check if all characters appear in order (lenient fuzzy)
    let patternIdx = 0;
    let score = 0;
    let consecutiveMatches = 0;
    
    for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
      if (strLower[i] === patternLower[patternIdx]) {
        consecutiveMatches++;
        score += (100 - i) + (consecutiveMatches * 10); // Bonus for consecutive matches
        patternIdx++;
      } else {
        consecutiveMatches = 0;
      }
    }
    
    // Return score only if we matched at least 60% of the pattern
    const matchPercentage = patternIdx / patternLower.length;
    return matchPercentage >= 0.6 ? score : 0;
  };

  // Debounced search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Search from multiple sources
      const [jikanRes, localRes] = await Promise.allSettled([
        axios.get(`/api/jikan/search?q=${encodeURIComponent(searchQuery)}&limit=15`),
        axios.get(`/api/anime/search?q=${encodeURIComponent(searchQuery)}&limit=15`)
      ]);

      let allResults = [];

      // Combine results from Jikan
      if (jikanRes.status === 'fulfilled' && jikanRes.value?.data?.data) {
        allResults = jikanRes.value.data.data.map(item => ({
          mal_id: item.mal_id,
          title: item.title,
          title_english: item.title_english,
          image: item.images?.jpg?.image_url || item.images?.jpg?.large_image_url,
          year: item.year || item.aired?.prop?.from?.year,
          score: item.score,
          type: item.type,
          episodes: item.episodes,
          genres: item.genres?.map(g => g.name) || [],
          synopsis: item.synopsis,
          source: 'jikan'
        }));
      }

      // Add local database results
      if (localRes.status === 'fulfilled' && localRes.value?.data) {
        const localAnime = localRes.value.data.map(item => ({
          _id: item._id,
          mal_id: item.mal_id,
          title: item.title,
          title_english: item.title_english,
          image: item.image,
          year: item.year,
          score: item.rating,
          genres: item.genres || [],
          type: item.type,
          episodes: item.episodes,
          synopsis: item.synopsis,
          source: 'local'
        }));
        allResults = [...allResults, ...localAnime];
      }

      // Remove duplicates (prefer Jikan source)
      const seen = new Set();
      const unique = allResults.filter(item => {
        const id = item.mal_id || item._id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      // Apply fuzzy matching and sort by relevance
      const scored = unique.map(item => ({
        ...item,
        relevance: fuzzyMatch(item.title, searchQuery)
      })).filter(item => item.relevance > 0);

      scored.sort((a, b) => b.relevance - a.relevance);

      setResults(scored.slice(0, 12)); // Top 12 results
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms debounce
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectAnime(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle anime selection
  const handleSelectAnime = (anime) => {
    saveToRecent(anime);
    const id = anime.mal_id || anime._id;
    const path = anime.source === 'jikan' ? `/jikan/${id}` : `/anime/${id}`;
    router.push(path);
    setQuery('');
    setResults([]);
    onClose();
  };

  // Handle recent search click
  const handleRecentClick = (recent) => {
    const path = recent.id.toString().startsWith('6') ? `/anime/${recent.id}` : `/jikan/${recent.id}`;
    router.push(path);
    onClose();
  };

  // Clear recent searches
  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('aniverse_recent_searches');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="search-overlay" onClick={onClose}>
        <div className="search-container" onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <button className="close-btn" onClick={onClose} aria-label="Close search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          <div className="search-header">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search anime by name... (e.g., Naruto, One Piece)"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="search-input"
              autoComplete="off"
              spellCheck="false"
            />
            {loading && (
              <div className="input-spinner" />
            )}
            {query && !loading && (
              <button className="clear-input-btn" onClick={() => { setQuery(''); setResults([]); }} aria-label="Clear search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="search-results">
            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <p>Searching...</p>
              </div>
            )}

            {!loading && !query && recentSearches.length > 0 && (
              <div className="recent-section">
                <div className="section-header">
                  <h3>Recent Searches</h3>
                  <button className="clear-recent" onClick={clearRecent}>Clear</button>
                </div>
                {recentSearches.map((recent, idx) => (
                  <div
                    key={idx}
                    className="result-item recent-item"
                    onClick={() => handleRecentClick(recent)}
                  >
                    <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {recent.image && (
                      <img src={recent.image} alt="" className="result-image" />
                    )}
                    <span className="result-title">{recent.title}</span>
                  </div>
                ))}
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p>No anime found for "{query}"</p>
                <span className="hint">Try different keywords or check spelling</span>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="results-list">
                <div className="results-header">
                  <span className="results-count">{results.length} results found</span>
                </div>
                {results.map((result, idx) => (
                  <div
                    key={result.mal_id || result._id}
                    className={`result-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSelectAnime(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    {result.image && (
                      <div className="result-image-wrapper">
                        <img src={result.image} alt={result.title} className="result-image" />
                      </div>
                    )}
                    <div className="result-info">
                      <div className="result-title">{result.title}</div>
                      {result.title_english && result.title !== result.title_english && (
                        <div className="result-subtitle">{result.title_english}</div>
                      )}
                      <div className="result-meta">
                        {result.year && <span className="meta-year">{result.year}</span>}
                        {result.type && <span className="meta-type">{result.type}</span>}
                        {result.score && <span className="meta-score">⭐ {result.score.toFixed(1)}</span>}
                        {result.episodes && <span className="meta-episodes">{result.episodes} eps</span>}
                      </div>
                      {result.genres && result.genres.length > 0 && (
                        <div className="result-genres">
                          {result.genres.slice(0, 3).map((genre, gIdx) => (
                            <span key={gIdx} className="genre-tag">{genre}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                ))}
              </div>
            )}

            {!loading && !query && recentSearches.length === 0 && (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p>Search for anime</p>
                <span className="hint">Try "Naruto", "Attack on Titan", or "Demon Slayer"</span>
              </div>
            )}
          </div>

          <div className="search-footer">
            <div className="keyboard-hints">
              <kbd>↑↓</kbd> Navigate
              <kbd>↵</kbd> Select
              <kbd>Esc</kbd> Close
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .search-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 10vh;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .search-container {
          position: relative;
          width: min(700px, 90vw);
          background: rgba(18, 18, 18, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        @keyframes slideDown {
          from { transform: translateY(-30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 10;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: rotate(90deg);
        }

        .close-btn svg {
          width: 20px;
          height: 20px;
          stroke-width: 2;
        }

        .search-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 24px;
          padding-right: 60px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(135deg, rgba(88, 86, 214, 0.05), rgba(221, 42, 123, 0.05));
        }

        .search-icon {
          width: 24px;
          height: 24px;
          color: rgba(255, 255, 255, 0.7);
          flex-shrink: 0;
          stroke-width: 2;
        }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 18px;
          color: white;
          font-family: inherit;
          font-weight: 500;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
        }

        .input-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #5856d6;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }

        .clear-input-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .clear-input-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .clear-input-btn svg {
          width: 16px;
          height: 16px;
          stroke-width: 2.5;
        }

        .search-results {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .search-results::-webkit-scrollbar {
          width: 8px;
        }

        .search-results::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .search-results::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .search-results::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 16px;
          color: rgba(255, 255, 255, 0.6);
        }

        .loading-state {
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #5856d6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          font-size: 15px;
          font-weight: 500;
        }

        .empty-state svg {
          width: 64px;
          height: 64px;
          opacity: 0.3;
          stroke-width: 1.5;
        }

        .empty-state p {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
        }

        .hint {
          font-size: 14px;
          opacity: 0.6;
          text-align: center;
        }

        .recent-section {
          margin-bottom: 16px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px 12px;
        }

        .section-header h3 {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .clear-recent {
          background: none;
          border: none;
          color: #5856d6;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .clear-recent:hover {
          background: rgba(88, 86, 214, 0.1);
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .results-header {
          padding: 8px 14px 12px;
          margin-bottom: 4px;
        }

        .results-count {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .result-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid transparent;
        }

        .result-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .result-item.selected {
          background: linear-gradient(135deg, rgba(88, 86, 214, 0.15), rgba(221, 42, 123, 0.15));
          border-color: rgba(88, 86, 214, 0.4);
          box-shadow: 0 4px 12px rgba(88, 86, 214, 0.2);
          transform: translateX(4px);
        }

        .recent-item {
          background: rgba(255, 255, 255, 0.02);
          align-items: center;
        }

        .clock-icon {
          width: 20px;
          height: 20px;
          color: rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
          stroke-width: 2;
        }

        .result-image-wrapper {
          flex-shrink: 0;
          position: relative;
        }

        .result-image {
          width: 56px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .result-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .result-title {
          font-size: 15px;
          font-weight: 600;
          color: white;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.4;
        }

        .result-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-style: italic;
        }

        .result-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .result-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .meta-score {
          color: #ffd700;
          font-weight: 600;
        }

        .meta-type {
          padding: 2px 8px;
          background: rgba(88, 86, 214, 0.2);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .result-genres {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .genre-tag {
          padding: 3px 10px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          white-space: nowrap;
        }

        .arrow-icon {
          width: 20px;
          height: 20px;
          color: rgba(255, 255, 255, 0.3);
          flex-shrink: 0;
          stroke-width: 2;
          transition: all 0.2s;
        }

        .result-item:hover .arrow-icon,
        .result-item.selected .arrow-icon {
          color: rgba(255, 255, 255, 0.7);
          transform: translateX(2px);
        }

        .search-footer {
          padding: 14px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .keyboard-hints {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          align-items: center;
          justify-content: center;
        }

        .keyboard-hints kbd {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          color: rgba(255, 255, 255, 0.8);
          min-width: 24px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        }

        kbd {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 2px 6px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .recent-item .result-title {
          flex: 1;
        }

        @media (max-width: 640px) {
          .search-container {
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }

          .result-meta {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
};

export { SmartSearch };
export default SmartSearch;
