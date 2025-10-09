import React, { useEffect, useRef, useState, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Image from 'next/image';
import PosterImage from '../src/components/PosterImage';
import RecommendationHero from '../src/components/RecommendationHero';
import ThreeBackground from '../src/components/ThreeBackground';
import AnimeGrid from '../src/components/AnimeGrid';
import ReviewSystem from '../src/components/ReviewSystem';
import SeasonRoadmap, { SEASONS } from '../src/components/SeasonRoadmap';
import RecommendationModes from '../src/components/RecommendationModes';
const DynamicTimeline = dynamic(() => import('../src/components/RecommendationTimeline'), { ssr:false, loading: () => <div style={{padding:'4rem', textAlign:'center'}}>Preparing timeline...</div> });
import axios from 'axios';
import { useToast } from '../src/components/ToastProvider';
import SkeletonCard from '../src/components/SkeletonCard';
import { gradients, colors, shadows } from '../src/theme/tokens';
import { useCardEntranceAnimation } from '../src/hooks/useCardEntranceAnimation';
import { useRecommendations } from '../src/hooks/useRecommendations';
import { loadStripe } from '@stripe/stripe-js';

const algorithms = [
  { key:'hybrid', label:'Hybrid' },
  { key:'content', label:'Content' },
  { key:'collaborative', label:'Collaborative' },
  { key:'popular', label:'Popular' }
];

const RecommendationsPage = () => {
  // Conditional router - only use on client-side
  const router = typeof window !== 'undefined' ? useRouter() : null;
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [season, setSeason] = useState('s1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('hybrid');
  const [timelineShouldPlay, setTimelineShouldPlay] = useState(false);
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const [meta, setMeta] = useState({ guest:false, warning:null, algorithm:null, degraded:false });
  const [selectedAnimeInfo, setSelectedAnimeInfo] = useState({ title: '', seasonData: [], malId: null, poster: '', totalEpisodes: 0, streaming: [] });
  const [selectedAnimeEpisodes, setSelectedAnimeEpisodes] = useState([]);
  const [episodeFilter, setEpisodeFilter] = useState('all'); // all | canon
  const [topMovies, setTopMovies] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const staticLocalFallback = React.useMemo(() => [
    { _id:'local1', title:'Attack on Titan', genres:['Action','Drama'], image:'https://cdn.myanimelist.net/images/anime/10/47347.jpg' },
    { _id:'local2', title:'Demon Slayer', genres:['Action','Supernatural'], image:'https://cdn.myanimelist.net/images/anime/1286/99889.jpg' },
    { _id:'local3', title:'Your Name', genres:['Romance','Drama'], image:'https://cdn.myanimelist.net/images/anime/5/87048.jpg' },
    { _id:'local4', title:'Fullmetal Alchemist: Brotherhood', genres:['Action','Adventure'], image:'https://cdn.myanimelist.net/images/anime/1223/96541.jpg' },
    { _id:'local5', title:'Steins;Gate', genres:['Sci-Fi','Thriller'], image:'https://cdn.myanimelist.net/images/anime/1935/127974.jpg' }
  ], []);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [fetchEnabled, setFetchEnabled] = useState(false);

  useEffect(() => {
    // Restore persisted selections
    try {
      const savedAlg = localStorage.getItem('aniverse.selectedAlgorithm');
      if (savedAlg) setSelectedAlgorithm(savedAlg);
      const savedSeason = localStorage.getItem('aniverse.selectedSeason');
      if (savedSeason) setSeason(savedSeason);
    } catch {}
    // Read query param ?search
    if (router && router.query && typeof router.query.search === 'string') {
      setSearchQuery(router.query.search);
    }
    // Check if anime parameter exists for roadmap view
    if (router && router.query && router.query.anime) {
      const animeId = router.query.anime;
      // Check if we have data parameter for immediate display
      if (router.query.data) {
        try {
          const animeData = JSON.parse(decodeURIComponent(router.query.data));
          handleSelectAnime(animeData);
        } catch (error) {
          console.error('Error parsing anime data:', error);
          // Fallback to fetching from API
          (async () => {
            try {
              // Try local API first
              let response;
              try {
                response = await axios.get(`/api/anime/${animeId}`);
              } catch {
                // Fallback to Jikan API
                response = await axios.get(`/api/jikan/anime/${animeId}`);
              }
              if (response.data) {
                handleSelectAnime(response.data);
              }
            } catch (error) {
              console.error('Error fetching anime for roadmap:', error);
            }
          })();
        }
      } else {
        // Fetch anime details and show roadmap
        (async () => {
          try {
            // Try local API first
            let response;
            try {
              response = await axios.get(`/api/anime/${animeId}`);
            } catch {
              // Fallback to Jikan API
              response = await axios.get(`/api/jikan/anime/${animeId}`);
            }
            if (response.data) {
              handleSelectAnime(response.data);
            }
          } catch (error) {
            console.error('Error fetching anime for roadmap:', error);
          }
        })();
      }
    }
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    }
    // Attempt to get a suggested algorithm silently (will use guest popular if unauthenticated)
    (async () => {
      try {
        const tokenLocal = localStorage.getItem('token');
        const headers = tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {};
        const resp = await axios.get('/api/recommend?limit=1&prefetch=1', { headers });
        if (resp.data?.suggestedAlgorithm) {
          setSelectedAlgorithm(prev => prev === 'hybrid' ? resp.data.suggestedAlgorithm : prev);
        }
      } catch { /* ignore */ }
    })();

    // Listen for custom roadmap event from RecommendationModes
    const handleShowRoadmap = (event) => {
      const animeData = event.detail;
      handleSelectAnime(animeData);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('showRoadmap', handleShowRoadmap);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('showRoadmap', handleShowRoadmap);
      }
    };
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Continue as guest user
    }
  };

  const fetchRecommendations = async (algorithm = 'hybrid', activeSeason = season) => {
    if (loading) return; // prevent duplicate fetches
    setLoading(true);
    setError(null);
    setShowSkeletons(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`/api/recommend?algorithm=${algorithm}&limit=20&season=${activeSeason}`, {
        headers
      });
      
      const data = response.data;
  setRecommendations(data.recommendations);
      setMeta({ guest: !!data.guest, warning: data.warning || null, algorithm: data.algorithm, degraded: !!data.degraded });
      if (data.warning) {
        toast.push({ type:'warning', title:'Fallback Mode', message:data.warning, icon:'⚠' });
      }
      if (data.guest) {
        toast.push({ type:'info', title:'Guest Mode', message:'Sign in to personalize your recommendations.', icon:'👤', ttl:5000 });
      }
      
  // recommendations loaded; if not already visible make it visible
  if (!showTimeline) setShowTimeline(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Network or server completely down -> provide local static fallback instead of full error page
      if (!showTimeline) setShowTimeline(true);
      setRecommendations(staticLocalFallback);
      setMeta(m => ({ ...m, degraded:true, warning: 'Network error. Showing offline static selection.' }));
      toast.push({ type:'error', title:'Network Issue', message:'Using offline static fallback.', icon:'✖' });
    } finally {
      setLoading(false);
      setShowSkeletons(false);
    }
  };

  const handleStartRecommendations = () => {
    setTimelineShouldPlay(true);
    setTimelineLoaded(true);
    // show roadmap immediately, cards will fill when fetch completes
    setShowTimeline(true);
    setFetchEnabled(true);
    fetchRecommendations(selectedAlgorithm, season);
    // Prefetch Top Movies (special category)
    (async () => {
      try {
        const resp = await axios.get('/api/jikan/top?limit=50&type=movie');
        const items = Array.isArray(resp.data?.anime) ? resp.data.anime : [];
        setTopMovies(items.slice(0, 20));
      } catch {}
    })();
  };

  // When a user clicks Details in the top list, show the roadmap and tailor recommendations around that anime
  const handleSelectAnime = async (anime) => {
    try {
      setShowTimeline(true);
      setFetchEnabled(true);
      setTimelineShouldPlay(true);
      setTimelineLoaded(true);
      setLoading(true);
      setError(null);
      // Build season roadmap data for the selected anime
  let title = anime.title || '';
  let seasonData = [];
  let malId = anime.mal_id || null;
  let poster = anime.image || anime.poster || '';
  let totalEpisodes = 0;
  let streaming = [];
      const palette = ['#6bc5ff','#8fff9f','#ffd36b','#ff8f6b','#b28bff'];
      try {
        // If no MAL id, try to resolve via Jikan search by title (best-effort)
        if (!malId && title) {
          try {
            const { data: search } = await axios.get(`/api/jikan/search?q=${encodeURIComponent(title)}&limit=5`);
            const candidates = Array.isArray(search?.anime) ? search.anime : [];
            if (candidates.length > 0) {
              const best = candidates.find(a => (a.title || '').toLowerCase() === title.toLowerCase()) || candidates[0];
              malId = best.mal_id;
            }
          } catch { /* ignore search failure */ }
        }

        // Prefer Jikan details when we have a MAL id (richer, public data)
        if (malId) {
          const { data: details } = await axios.get(`/api/jikan/anime/${encodeURIComponent(malId)}`);
          const epCount = typeof details?.episodes === 'number' ? details.episodes : 0;
          const seasonCount = Math.max(1, Math.min(5, Math.ceil((epCount || 12) / 12)));
          seasonData = Array.from({ length: seasonCount }).map((_, i) => ({ key:`s${i+1}`, label:`Season ${i+1}`, color: palette[i % palette.length] }));
          title = details?.title || title;
          poster = details?.images?.jpg?.large_image_url || details?.images?.jpg?.image_url || poster;
          totalEpisodes = epCount || 0;
          streaming = Array.isArray(details?.streaming) ? details.streaming : [];
          // collect related movies from relations
          try {
            const rels = Array.isArray(details?.relations) ? details.relations : [];
            const relMovies = rels.flatMap(r => (Array.isArray(r.entry) ? r.entry : []).map(e => ({ ...e, relation: r.relation })) )
              .filter(e => (e.type || '').toLowerCase() === 'anime' && /movie/i.test(e.name || e.title || ''));
            setRelatedMovies(relMovies);
          } catch {}
            // Fetch all episodes for this anime (paginate)
          try {
            let all = [];
            let page = 1;
            const limit = 100;
            for (let i = 0; i < 10; i++) {
              const { data: eps } = await axios.get(`/api/jikan/anime/${encodeURIComponent(malId)}/episodes?page=${page}&limit=${limit}`);
              const list = Array.isArray(eps?.episodes) ? eps.episodes : [];
              all = all.concat(list);
              const hasNext = eps?.pagination?.has_next_page;
              if (!hasNext || list.length === 0) break;
              page += 1;
            }
            setSelectedAnimeEpisodes(all);
            if (!totalEpisodes && all.length) totalEpisodes = all.length;

            // --- New: attempt to group episodes into production seasons by air-date gaps ---
            const parseAirDate = (ep) => {
              // Try multiple known date fields that may be present in different API versions
              const cand = ep.aired || ep.aired_at || ep.aired_on || ep.aired_date || (ep.aired && (ep.aired.from || ep.aired.date));
              if (!cand) return null;
              const d = Date.parse(cand);
              if (!isNaN(d)) return new Date(d);
              // try other nested formats
              if (ep.aired && typeof ep.aired === 'object') {
                const from = ep.aired.from || ep.aired_from || ep.airedDate;
                const dd = Date.parse(from);
                if (!isNaN(dd)) return new Date(dd);
              }
              return null;
            };

            // Normalize episodes with number + parsed date
            const normalized = all.map((ep, idx) => {
              const num = ep.episode || ep.number || ep.mal_id || (idx + 1);
              const date = parseAirDate(ep);
              return { ...ep, __num: Number(num) || (idx + 1), __date: date };
            }).sort((a, b) => (a.__num - b.__num));

            // If we have at least some valid dates, split into seasons where there's a large gap
            const gapDays = 60; // gap threshold in days to mark a new production season
            let seasons = [];
            if (normalized.some(e => e.__date)) {
              let current = [];
              for (let i = 0; i < normalized.length; i++) {
                const ep = normalized[i];
                if (current.length === 0) {
                  current.push(ep);
                } else {
                  const prev = current[current.length - 1];
                  if (prev.__date && ep.__date) {
                    const diff = (ep.__date - prev.__date) / (1000 * 60 * 60 * 24);
                    if (diff > gapDays) {
                      seasons.push(current);
                      current = [ep];
                    } else {
                      current.push(ep);
                    }
                  } else {
                    // missing date on one side -> just append
                    current.push(ep);
                  }
                }
              }
              if (current.length) seasons.push(current);
            }

            // Fallback: if no date-based grouping produced more than one season, but total ep count suggests multiple
            if ((!seasons || seasons.length <= 1) && normalized.length > 12) {
              const estCount = Math.max(1, Math.min(5, Math.ceil(normalized.length / 12)));
              const per = Math.ceil(normalized.length / estCount);
              seasons = Array.from({ length: estCount }).map((_, i) => normalized.slice(i * per, (i + 1) * per)).filter(g => g.length);
            }

            // If still empty, create a single season group
            if (!seasons || seasons.length === 0) seasons = [normalized];

            // Build seasonData entries with episodes arrays and descriptive subtitle
            const seasonGroups = seasons.map((group, i) => {
              const start = group[0]?.__num || 1;
              const end = group[group.length - 1]?.__num || group.length;
              const startDate = group[0]?.__date ? group[0].__date.toLocaleDateString() : null;
              const endDate = group[group.length - 1]?.__date ? group[group.length - 1].__date.toLocaleDateString() : null;
              const subtitle = `${group.length} ep${group.length>1?'s':''}${startDate && endDate ? ` · ${startDate} — ${endDate}` : ''}`;
              return { key:`s${i+1}`, label:`Season ${i+1}`, color: palette[i % palette.length], subtitle, episodes: group };
            });

            // Use the season groups if they look reasonable
            if (seasonGroups && seasonGroups.length > 0) {
              seasonData = seasonGroups;
            }

          } catch {}
        } else {
          // Fallback to local database details if MAL id is missing
          const id = anime._id || anime.id;
          if (id) {
            const { data: details } = await axios.get(`/api/anime/${encodeURIComponent(id)}`);
            if (Array.isArray(details?.seasons) && details.seasons.length) {
              seasonData = details.seasons.slice(0,5).map((s, i) => ({ key:`s${i+1}`, label: s.name || s.label || `Season ${i+1}`, color: palette[i % palette.length], months: s.subtitle || '' }));
            } else {
              const epCount = Array.isArray(details?.episodes) ? details.episodes.length : (details?.episodeCount || 0);
              const seasonCount = Math.max(1, Math.min(5, Math.ceil((epCount || 12) / 12)));
              seasonData = Array.from({ length: seasonCount }).map((_, i) => ({ key:`s${i+1}`, label:`Season ${i+1}`, color: palette[i % palette.length] }));
            }
            title = details?.title || title;
            poster = details?.image || details?.poster || poster;
            totalEpisodes = Array.isArray(details?.episodes) ? details.episodes.length : (details?.episodeCount || 0);
            setSelectedAnimeEpisodes(Array.isArray(details?.episodes) ? details.episodes : []);
          }
        }
      } catch {
        // Fallback generic seasons
        seasonData = Array.from({ length: 3 }).map((_, i) => ({ key:`s${i+1}`, label:`Season ${i+1}`, color: palette[i % palette.length] }));
      }
  setSelectedAnimeInfo({ title, seasonData, malId, poster, totalEpisodes, streaming });
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Ask backend for recommendations biased around this anime (fallback to hybrid if unsupported)
      const { data } = await axios.get(`/api/recommend?algorithm=${selectedAlgorithm}&limit=20&seedId=${encodeURIComponent(anime._id || anime.id || '')}&season=${season}` , { headers });
      if (Array.isArray(data?.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        // fallback to generic fetch
        await fetchRecommendations(selectedAlgorithm, season);
      }
      setMeta(m => ({ ...m, warning: data?.warning || m.warning, algorithm: data?.algorithm || m.algorithm, degraded: !!data?.degraded }));
      // Smooth scroll to roadmap section
      const el = document.querySelector('.post-start-wrapper');
      if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    } catch (e) {
      await fetchRecommendations(selectedAlgorithm, season);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimeClick = async (anime) => {
    // Track interaction
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('/api/recommend/interact', {
          animeId: anime._id,
          interactionType: 'view'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }

    // Navigate to anime details
    router.push(`/anime/${anime._id || anime.id}`);
  };

  // Removed watch flow per UI update

  const handleAlgorithmChange = (algorithm) => {
    if (loading) return; // ignore while loading
    setSelectedAlgorithm(algorithm);
    try { localStorage.setItem('aniverse.selectedAlgorithm', algorithm); } catch {}
    if (showTimeline) {
      setTransitioning(true);
      startTransition(() => fetchRecommendations(algorithm, season).finally(()=>setTransitioning(false)));
    }
  };

  const handleVerifyIdentity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.push({ type:'warning', title:'Login required', message:'Please log in to verify your identity.' });
      const { data } = await axios.post('/api/identity/session', {}, { headers: { Authorization: `Bearer ${token}` } });
      // Stripe Identity uses client_secret with the identity modal; the web SDK is evolving
      // For now, redirect to hosted verification if available
      if (data?.client_secret) {
        // Optional: Show info toast while redirecting
        toast.push({ type:'info', title:'Verification', message:'Redirecting to verification...', ttl:2500 });
        window.location.href = `https://verify.stripe.com/start/${data.client_secret}`;
      }
    } catch (err) {
      toast.push({ type:'error', title:'Verification failed', message: err?.response?.data?.error || err.message });
    }
  };

  const handleUpgrade = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.push({ type:'warning', title:'Login required', message:'Please log in to upgrade.' });
      const { data } = await axios.post('/api/billing/checkout-session', {}, { headers: { Authorization: `Bearer ${token}` } });
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      if (data?.id) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
        if (!stripe) return window.location.href = data.url; // fallback
        await stripe.redirectToCheckout({ sessionId: data.id });
      }
    } catch (err) {
      toast.push({ type:'error', title:'Upgrade failed', message: err?.response?.data?.error || err.message });
    }
  };
  const handleSeasonChange = (s) => {
    setSeason(s);
    try { localStorage.setItem('aniverse.selectedSeason', s); } catch {}
    if (showTimeline) {
      setTransitioning(true);
      startTransition(() => fetchRecommendations(selectedAlgorithm, s).finally(()=>setTransitioning(false)));
      // Smooth scroll to recommendation section
      const el = document.querySelector('.recommendation-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helpers for episode slicing per selected season
  const seasonIndex = Math.max(0, (season && season.startsWith('s') ? (parseInt(season.slice(1)) - 1) : 0));
  const seasonSliceRange = (total) => {
    const size = 12;
    const start = seasonIndex * size + 1; // 1-based
    const end = Math.min(total || (seasonIndex + 1) * size, (seasonIndex + 1) * size);
    return [start, end];
  };
  const episodesForSeason = () => {
    // If seasonData contains grouped episodes (from date-gap grouping), prefer that
    try {
      const sd = selectedAnimeInfo?.seasonData;
      if (Array.isArray(sd) && sd.length > 0 && sd[0].episodes) {
        const idx = Math.max(0, (season && season.startsWith('s') ? (parseInt(season.slice(1)) - 1) : 0));
        const group = sd[idx] || [];
        const arr = Array.isArray(group) ? group : (group.episodes || []);
        if (!arr || arr.length === 0) return [];
        return arr.filter(ep => {
          if (episodeFilter === 'canon') return !ep.filler;
          return true;
        });
      }
    } catch (e) {
      // ignore and fallback
    }

    if (!selectedAnimeEpisodes || selectedAnimeEpisodes.length === 0) return [];
    const [start, end] = seasonSliceRange(selectedAnimeInfo?.totalEpisodes || selectedAnimeEpisodes.length);
    return selectedAnimeEpisodes.filter(ep => {
      const num = ep.episode || ep.number || 0;
      const inRange = num >= start && num <= end;
      if (!inRange) return false;
      if (episodeFilter === 'canon') return !ep.filler; // exclude filler
      return true;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Idle prefetch recommendations for secondary algorithms to warm cache
    const idle = window.requestIdleCallback || function(cb){ return setTimeout(cb, 1500); };
    idle(() => {
      const other = algorithms.filter(a => a.key !== selectedAlgorithm).slice(0,2); // limit
      other.forEach(o => {
        fetch(`/api/recommend?algorithm=${o.key}&limit=5&prefetch=1`, { headers: { 'x-prefetch': '1' } }).catch(()=>{});
      });
    });
  }, [selectedAlgorithm]);

  // Remove full-screen loading; inline loaders handled in sections
  useCardEntranceAnimation([recommendations]);

  // If arriving right after login/signup, or with #browse, scroll to the anime list
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const justAuthed = localStorage.getItem('aniverse.justAuthed');
      const hash = window.location.hash;
      if (justAuthed === '1' || hash === '#browse' || hash === '#choose-style') {
        localStorage.removeItem('aniverse.justAuthed');
        // Use a timeout to ensure the element is rendered
        setTimeout(() => {
          const el = document.getElementById('browse');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch {}
  }, []);

  // SWR: keep recommendations warm in background after start
  const swr = useRecommendations(selectedAlgorithm, season, fetchEnabled);
  useEffect(() => {
    if (!swr?.data) return;
    const data = swr.data;
    if (Array.isArray(data.recommendations)) {
      setRecommendations(data.recommendations);
    }
    setMeta(m => ({
      ...m,
      warning: data.warning || m.warning,
      algorithm: data.algorithm || m.algorithm,
      degraded: typeof data.degraded === 'boolean' ? data.degraded : m.degraded,
    }));
  }, [swr.data]);

  // Remove full-screen fatal error page; always attempt to show timeline + fallback cards

  return (
  <div className="recommendations-page">
      {/* Background always visible for consistent premium experience */}
      <div className="hero-wrap">
        <ThreeBackground className="hero-bg" />
      </div>

      {showSkeletons && !showTimeline && (
        <div className="skeleton-grid" role="status" aria-label="Loading recommendations">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!showTimeline ? (
        <>
          <div className="hero-inner">
            <RecommendationHero 
              user={user} 
              onStartRecommendations={handleStartRecommendations}
              showStartCta={false}
            />
          </div>
          {/* New: Advanced Recommendation Modes */}
          <section className="recommendation-modes-section" id="browse-section">
            <RecommendationModes />
          </section>
        </>
      ) : (
        <div className={`post-start-wrapper ${showTimeline ? 'reveal' : ''}`}>
          {!!user && (
            <div className="profile-pill" role="status" aria-label={`Logged in as ${user.username}`}>
              <span className="avatar" aria-hidden>👤</span>
              <span className="name">{user.username}</span>
              {user.verified && <span className="badge verify" title="Verified">Verified</span>}
              {user.premium && <span className="badge premium" title="Premium">Premium</span>}
              {!user.verified && <button className="mini" onClick={handleVerifyIdentity}>Verify</button>}
              {!user.premium && <button className="mini" onClick={handleUpgrade}>Go Premium</button>}
            </div>
          )}
          {selectedAnimeInfo.title && (
            <div className="selected-anime-summary">
              <h3 className="anime-title">{selectedAnimeInfo.title}</h3>
            </div>
          )}
          
          {/* Main roadmap heading */}
          <div className="roadmap-main-heading">
            <h2>Roadmap to Anime</h2>
          </div>
          
          <SeasonRoadmap
            activeSeason={season}
            onSelect={handleSeasonChange}
            disabled={loading}
            seasonData={selectedAnimeInfo.seasonData}
            relatedMovies={relatedMovies}
          />
          {/* Episodes for the selected anime and season */}
          {episodesForSeason().length > 0 && (
            <div className="episodes-section">
              <div className="ep-header">
                <h2 className="section-title">{(selectedAnimeInfo?.seasonData && selectedAnimeInfo.seasonData[Math.max(0, (season && season.startsWith('s') ? (parseInt(season.slice(1)) - 1) : 0))]?.label) || (SEASONS.find(s => s.key === season)?.label || 'Season')} Episodes</h2>
                {/* Start button: opens first available platform for the anime */}
                {Array.isArray(selectedAnimeInfo.streaming) && selectedAnimeInfo.streaming.length > 0 && (
                  <a
                    className="start-btn"
                    href={selectedAnimeInfo.streaming[0]?.url || '#'}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`Start watching ${selectedAnimeInfo.title} on ${selectedAnimeInfo.streaming[0]?.name || 'available platform'}`}
                  >
                    Start
                  </a>
                )}
              </div>
              <div className="ep-filters" role="tablist" aria-label="Episode filters">
                <button className={episodeFilter==='all'?'active':''} onClick={()=>setEpisodeFilter('all')} role="tab" aria-selected={episodeFilter==='all'}>All</button>
                <button className={episodeFilter==='canon'?'active':''} onClick={()=>setEpisodeFilter('canon')} role="tab" aria-selected={episodeFilter==='canon'}>Canon only</button>
              </div>
              <div className="ep-grid">
                {episodesForSeason().map((ep, idx) => {
                  const epNum = ep.episode || ep.number || idx + 1;
                  const epTitle = ep.title || ep.title_romanji || ep.title_japanese || 'Untitled';
                  // Normalize streaming providers and build links
                  const known = {
                    crunchyroll: { match: /crunchyroll/i, label: 'Crunchyroll' },
                    netflix: { match: /netflix/i, label: 'Netflix' },
                    disney: { match: /disney\+|disney plus|hotstar|disney\+ hotstar/i, label: 'Disney+ Hotstar' },
                    jiocinema: { match: /jio\s*cine(ma)?/i, label: 'JioCinema' },
                    youtube: { match: /you\s*tube/i, label: 'YouTube' },
                  };
                  const platforms = Array.isArray(selectedAnimeInfo.streaming) ? selectedAnimeInfo.streaming : [];
                  const available = Object.entries(known).map(([key, meta]) => {
                    const found = platforms.find(p => meta.match.test(p.name || p.url || ''));
                    if (!found) return null;
                    const url = found.url || '';
                    return { key, label: meta.label, url };
                  }).filter(Boolean);
                  return (
                    <div key={ep.mal_id || epNum || idx} className="ep-card" role="listitem" aria-label={`Episode ${epNum}: ${epTitle}`}>
                      <div className="thumb" aria-hidden>
                        <div className="bg" />
                        <div className="overlay">
                          <div className="badge">Ep {epNum}</div>
                          <div className="ep-title">{epTitle}</div>
                        </div>
                      </div>
                      {available.length > 0 && (
                        <div className="card-actions" role="group" aria-label="Available platforms">
                          {available.map((pl) => (
                            <a key={pl.key} href={pl.url} target="_blank" rel="noreferrer noopener" className={`watch platform ${pl.key}`} aria-label={`Watch on ${pl.label}`}>{pl.label}</a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="recommendation-section">
            <h2 className="section-title">{(SEASONS.find(s => s.key === season)?.label || 'Season')} Picks</h2>
            {loading && <div className="loading-small" role="status">Loading...</div>}
            {!loading && recommendations.length === 0 && (
              <div className="empty" role="status">No recommendations yet.</div>
            )}
            <div className="rec-grid">
              {recommendations.map(anime => (
                <div key={anime._id || anime.id} className="rec-card" aria-label={anime.title}>
                  <div className="poster" onClick={() => handleAnimeClick(anime)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') handleAnimeClick(anime); }}>
                    <PosterImage title={anime.title} src={anime.image || anime.poster} alt={anime.title} />
                  </div>
                  <div className="info">
                    <h3 className="title">{anime.title}</h3>
                    {anime.genres && <div className="genres">{anime.genres.slice(0,3).join(', ')}</div>}
                    <div className="actions">
                      <button onClick={() => handleSelectAnime(anime)} className="details-btn">Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Special category: Top Movies */}
          {topMovies.length > 0 && (
            <div className="recommendation-section">
              <h2 className="section-title">Special: Top Movies</h2>
              <div className="rec-grid">
                {topMovies.map(m => (
                  <div key={m.mal_id} className="rec-card" aria-label={m.title}>
                    <div className="poster" onClick={() => router.push(`/jikan/${m.mal_id}`)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') router.push(`/jikan/${m.mal_id}`); }}>
                      <PosterImage title={m.title} src={m.images?.jpg?.large_image_url || m.images?.jpg?.image_url} alt={m.title} />
                    </div>
                    <div className="info">
                      <h3 className="title">{m.title}</h3>
                      {m.genres && <div className="genres">{(m.genres||[]).slice(0,3).join(', ')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Related movies for selected anime */}
          {relatedMovies.length > 0 && (
            <div className="recommendation-section">
              <h2 className="section-title">Movies related to {selectedAnimeInfo.title}</h2>
              <div className="rec-grid">
                {relatedMovies.map((rm, idx) => (
                  <div key={rm.mal_id || idx} className="rec-card" aria-label={rm.name || rm.title}>
                    <div className="poster" onClick={() => router.push(`/jikan/${rm.mal_id || ''}`)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') router.push(`/jikan/${rm.mal_id || ''}`); }}>
                      <PosterImage title={rm.name || rm.title} src={selectedAnimeInfo.poster} alt={rm.name || rm.title} />
                    </div>
                    <div className="info">
                      <h3 className="title">{rm.name || rm.title}</h3>
                      <div className="genres">{rm.relation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Review System */}
          {selectedAnimeInfo.title && selectedAnimeInfo.malId && (
            <div className="recommendation-section">
              <ReviewSystem 
                animeId={selectedAnimeInfo.malId} 
                animeTitle={selectedAnimeInfo.title}
              />
            </div>
          )}
        </div>
      )}

      {meta.warning && (
        <div className="status-banner warning" role="alert">{meta.warning}</div>
      )}
      {meta.degraded && (
        <div className="status-banner degraded" role="alert">Operating in degraded/offline mode. Some personalization features are unavailable.</div>
      )}
      {meta.guest && !meta.warning && (
        <div className="status-banner guest" role="status">Viewing popular picks in guest mode.</div>
      )}

      <style jsx>{`
  .recommendations-page { min-height:100vh; background:var(--color-bg); color:var(--color-text); display:flex; flex-direction:column; position:relative; }
  .hero-wrap { position:relative; isolation:isolate; z-index:1; contain:content; }
  /* Ensure hero video/background sits above subsequent content during initial load */
  .hero-wrap :global(.video-bg) { z-index: 2; }
  .hero-wrap :global(.hero-content),
  .hero-wrap :global(.hero-stats),
  .hero-wrap :global(.hero-bottom-fade) { z-index: 4; }
  .hero-bg { pointer-events:none; filter: saturate(1.1) brightness(1); opacity:0.7; }
  .hero-inner { position:relative; z-index:1; }
  .post-start-wrapper { padding:2rem 0 6rem; background:var(--color-bg); opacity:0; transform: translateY(24px); filter: blur(2px); transition: opacity .5s ease, transform .5s ease, filter .5s ease; }
  .post-start-wrapper.reveal { opacity:1; transform:none; filter:none; }
  .recommendation-section { max-width:1300px; margin:0 auto; padding:2rem 2rem 4rem; }
  .section-title { font-size:2rem; margin:0 0 1.5rem; background:linear-gradient(45deg, var(--color-accent), var(--color-accent-glow)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .rec-grid { display:grid; gap:1.75rem; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); }
  .rec-card { background:var(--color-surface); border:1px solid var(--color-border); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; position:relative; box-shadow:0 6px 20px -6px var(--color-shadow); transition:.35s; }
  .rec-card:hover { transform:translateY(-6px); box-shadow:0 12px 30px -6px var(--color-shadow); }
  .poster { position:relative; aspect-ratio:3/4; background:var(--color-bg-alt); cursor:pointer; }
  .poster img { width:100%; height:100%; object-fit:cover; display:block; }
  .no-img { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:.8rem; color:var(--color-text-dim); }
  .info { padding:.9rem .95rem 1.2rem; display:flex; flex-direction:column; gap:.55rem; }
  .title { font-size:1rem; margin:0; line-height:1.3; color:var(--color-text); }
  .genres { font-size:.65rem; letter-spacing:.5px; color:var(--color-text-dim); text-transform:uppercase; }
  .actions { display:flex; gap:.5rem; margin-top:.25rem; }
  .details-btn { flex:1; background:var(--color-surface); border:1px solid var(--color-border); color:var(--color-text); font-size:.7rem; letter-spacing:.5px; padding:.5rem .7rem; border-radius:8px; cursor:pointer; transition:.25s; }
  .details-btn:hover { background:var(--color-accent-alt); }
  .loading-small { padding:1rem; font-size:.9rem; color:var(--color-text-dim); }
  .empty { padding:2rem 0; text-align:center; font-size:.9rem; color:var(--color-text-dim); }

  .recommendation-modes-section {
    max-width: 1400px;
    margin: 0 auto;
    padding: 3rem 2rem;
    background: var(--color-bg);
    position: relative;
    z-index: 10;
  }

        .status-banner { text-align:center; padding:0.75rem 1rem; font-size:0.85rem; letter-spacing:.5px; }
  .status-banner.warning { background:linear-gradient(90deg,var(--color-accent-alt),var(--color-accent)); border-top:1px solid var(--color-accent); border-bottom:1px solid var(--color-accent); }
  .status-banner.degraded { background:linear-gradient(90deg,var(--color-accent),var(--color-accent-glow)); border-top:1px solid var(--color-accent); border-bottom:1px solid var(--color-accent-glow); }
        .status-banner.guest { background:linear-gradient(90deg,var(--color-accent-glow),var(--color-surface)); border-top:1px solid var(--color-accent-glow); border-bottom:1px solid var(--color-accent-glow); }

        .skeleton-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.5rem; padding:2rem; max-width:1200px; margin:0 auto; }

  .profile-pill { max-width:1300px; margin:0 auto; padding:0 2rem 0.5rem; display:flex; align-items:center; gap:.5rem; color:var(--color-text-dim); }
  .profile-pill .avatar { width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; background:var(--color-surface); border:1px solid var(--color-border); }
  .profile-pill .name { font-size:.9rem; letter-spacing:.4px; margin-right:.5rem; }
  .profile-pill .badge { font-size:.7rem; padding:.2rem .45rem; border-radius:999px; border:1px solid var(--color-border); margin-left:.3rem; }
  .profile-pill .badge.verify { background:var(--color-accent-glow); border-color:var(--color-accent-glow); color:var(--color-text); }
  .profile-pill .badge.premium { background:var(--color-accent); border-color:var(--color-accent); color:var(--color-glass); }
  .profile-pill .mini { margin-left:.4rem; font-size:.7rem; background:var(--color-surface); border:1px solid var(--color-border); color:var(--color-text); padding:.25rem .5rem; border-radius:8px; cursor:pointer; }

        .roadmap-main-heading {
          max-width: 1300px;
          margin: 2rem auto 1rem;
          padding: 0 2rem;
          text-align: center;
        }

        .roadmap-main-heading h2 {
          font-size: 2.5rem;
          margin: 0 0 1.5rem 0;
          background: linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-weight: 700;
        }
      `}</style>
      <style jsx>{`
        .episodes-section { max-width:1300px; margin:0 auto; padding:0 2rem 3rem; }
        .ep-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
        .ep-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:1rem; }
        .ep-card { background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; overflow:hidden; box-shadow: 0 6px 20px var(--color-shadow); transition: transform .25s ease, box-shadow .25s ease; }
        .ep-card:hover { transform: translateY(-4px); box-shadow: 0 10px 26px var(--color-shadow); border-color:var(--color-accent-glow); }
        .thumb { position:relative; aspect-ratio:16/9; overflow:hidden; background:var(--color-bg-alt); }
        .thumb .bg { position:absolute; inset:0; background-size:cover; background-position:center; filter:brightness(.5) saturate(1.05); transform: scale(1.02); }
        .thumb .overlay { position:absolute; inset:auto 0 0 0; padding:.75rem; background: linear-gradient(to top, var(--color-shadow), transparent); display:flex; flex-direction:column; gap:.35rem; }
        .thumb .badge { align-self:flex-start; background:var(--color-accent); border:1px solid var(--color-accent); color:var(--color-glass); font-weight:700; padding:.15rem .45rem; border-radius:6px; font-size:.8rem; }
        .thumb .ep-title { font-weight:600; color:var(--color-text); }
        .card-actions { display:flex; flex-wrap:wrap; gap:.4rem; padding:.6rem .75rem .8rem; }
        .watch { background:var(--color-glass); border:1px solid var(--color-border); border-radius:8px; padding:.3rem .55rem; color:var(--color-text); text-decoration:none; font-size:.8rem; transition:all .2s; }
        .watch:hover { background:var(--color-accent-glow); border-color:var(--color-accent); }
        .watch.platform.crunchyroll { border-color:var(--color-accent); }
        .watch.platform.netflix { border-color:var(--color-accent-alt); }
        .watch.platform.disney { border-color:var(--color-accent-glow); }
        .watch.platform.jiocinema { border-color:var(--color-accent); }
        .watch.platform.youtube { border-color:var(--color-accent); }
        .start-btn { 
          position: relative; 
          display: inline-flex; 
          align-items: center; 
          justify-content: center; 
          padding: 0.8rem 2rem; 
          min-width: 120px; 
          border-radius: 50px; 
          color: #000000; 
          text-decoration: none; 
          font-weight: 700; 
          letter-spacing: 1px; 
          text-transform: uppercase;
          border: none;
          background: linear-gradient(135deg, #d4af37, #ffd700, #ffed4e); 
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4); 
          overflow: hidden; 
          transition: all 0.3s ease; 
          text-shadow: none;
        }
        .start-btn::before { 
          content: ''; 
          position: absolute; 
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }
        .start-btn::after { 
          display: none;
        }
        .start-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 12px 30px rgba(212, 175, 55, 0.6);
          background: linear-gradient(135deg, #ffd700, #ffed4e, #d4af37);
          color: #000000;
        }
        .start-btn:hover::before {
          left: 100%;
        }
        .start-btn:focus-visible { 
          outline: 2px solid #ffd700; 
          outline-offset: 2px; 
        }
        .start-btn > * { 
          position: relative; 
          z-index: 1; 
        }
      `}</style>
      {/* dynamic background image for styled-jsx */}
      <style jsx>{`
        .thumb .bg { background-image: ${selectedAnimeInfo && selectedAnimeInfo.poster ? `url('${selectedAnimeInfo.poster}')` : 'none'}; }
      `}</style>
    </div>
  );
};

export default RecommendationsPage;