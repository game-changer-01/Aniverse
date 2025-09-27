import React, { useEffect, useRef, useState, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Image from 'next/image';
import PosterImage from '../src/components/PosterImage';
import RecommendationHero from '../src/components/RecommendationHero';
import AnimeGrid from '../src/components/AnimeGrid';
import SeasonRoadmap, { SEASONS } from '../src/components/SeasonRoadmap';
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
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [season, setSeason] = useState('s1');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('hybrid');
  const [timelineShouldPlay, setTimelineShouldPlay] = useState(false);
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const [meta, setMeta] = useState({ guest:false, warning:null, algorithm:null, degraded:false });
  const [selectedAnimeInfo, setSelectedAnimeInfo] = useState({ title: '', seasonData: [] });
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
      const palette = ['#6bc5ff','#8fff9f','#ffd36b','#ff8f6b','#b28bff'];
      try {
        const id = anime._id || anime.id;
        if (id) {
          const { data: details } = await axios.get(`/api/anime/${encodeURIComponent(id)}`);
          // If backend returns explicit seasons
          if (Array.isArray(details?.seasons) && details.seasons.length) {
            seasonData = details.seasons.slice(0,5).map((s, i) => ({ key:`s${i+1}`, label: s.name || s.label || `Season ${i+1}`, color: palette[i % palette.length], months: s.subtitle || '' }));
          } else {
            // Derive seasons from episode count if available
            const epCount = Array.isArray(details?.episodes) ? details.episodes.length : (details?.episodeCount || 0);
            const seasonCount = Math.max(1, Math.min(5, Math.ceil((epCount || 12) / 12)));
            seasonData = Array.from({ length: seasonCount }).map((_, i) => ({ key:`s${i+1}`, label:`Season ${i+1}`, color: palette[i % palette.length] }));
          }
          title = details?.title || title;
        }
      } catch {
        // Fallback generic seasons
        seasonData = Array.from({ length: 3 }).map((_, i) => ({ key:`s${i+1}`, label:`Season ${i+1}`, color: palette[i % palette.length] }));
      }
      setSelectedAnimeInfo({ title, seasonData });
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
    router.push(`/anime/${anime._id}`);
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
      {showSkeletons && !showTimeline && (
        <div className="skeleton-grid" role="status" aria-label="Loading recommendations">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!showTimeline ? (
        <>
          <div className="hero-wrap">
          <RecommendationHero 
            user={user} 
            onStartRecommendations={handleStartRecommendations}
            showStartCta={false}
          />
          </div>
          {/* New: show a browse grid first to let users pick an anime, then reveal roadmap on Details */}
          <AnimeGrid onSelectAnime={handleSelectAnime} />
          <div className="algorithm-selector" role="tablist" aria-label="Recommendation algorithm selection">
            <h3>Choose Your Recommendation Style</h3>
            <div className="algorithm-options">
              <button 
                role="tab"
                aria-selected={selectedAlgorithm === 'hybrid'}
                tabIndex={selectedAlgorithm === 'hybrid' ? 0 : -1}
                onClick={() => handleAlgorithmChange('hybrid')}
                onKeyDown={(e) => {
                  if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {
                    e.preventDefault();
                    const idx = algorithms.findIndex(a => a.key === selectedAlgorithm);
                    if (e.key === 'ArrowRight') {
                      handleAlgorithmChange(algorithms[(idx + 1) % algorithms.length].key);
                    } else if (e.key === 'ArrowLeft') {
                      handleAlgorithmChange(algorithms[(idx - 1 + algorithms.length) % algorithms.length].key);
                    } else if (e.key === 'Home') {
                      handleAlgorithmChange(algorithms[0].key);
                    } else if (e.key === 'End') {
                      handleAlgorithmChange(algorithms[algorithms.length - 1].key);
                    }
                  }
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAlgorithmChange('hybrid');
                  }
                }}
                className={selectedAlgorithm === 'hybrid' ? 'active' : ''}
                disabled={loading}
              >
                <div className="option-icon">🎯</div>
                <div className="option-text">
                  <strong>Smart Mix</strong>
                  <span>Best of all worlds</span>
                </div>
              </button>
              
              <button 
                role="tab"
                aria-selected={selectedAlgorithm === 'content'}
                tabIndex={selectedAlgorithm === 'content' ? 0 : -1}
                onClick={() => handleAlgorithmChange('content')}
                onKeyDown={(e) => {
                  if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {
                    e.preventDefault();
                    const idx = algorithms.findIndex(a => a.key === selectedAlgorithm);
                    if (e.key === 'ArrowRight') {
                      handleAlgorithmChange(algorithms[(idx + 1) % algorithms.length].key);
                    } else if (e.key === 'ArrowLeft') {
                      handleAlgorithmChange(algorithms[(idx - 1 + algorithms.length) % algorithms.length].key);
                    } else if (e.key === 'Home') {
                      handleAlgorithmChange(algorithms[0].key);
                    } else if (e.key === 'End') {
                      handleAlgorithmChange(algorithms[algorithms.length - 1].key);
                    }
                  }
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAlgorithmChange('content');
                  }
                }}
                className={selectedAlgorithm === 'content' ? 'active' : ''}
                disabled={loading}
              >
                <div className="option-icon">🔍</div>
                <div className="option-text">
                  <strong>Content Based</strong>
                  <span>Similar to what you like</span>
                </div>
              </button>
              
              <button 
                role="tab"
                aria-selected={selectedAlgorithm === 'collaborative'}
                tabIndex={selectedAlgorithm === 'collaborative' ? 0 : -1}
                onClick={() => handleAlgorithmChange('collaborative')}
                onKeyDown={(e) => {
                  if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {
                    e.preventDefault();
                    const idx = algorithms.findIndex(a => a.key === selectedAlgorithm);
                    if (e.key === 'ArrowRight') {
                      handleAlgorithmChange(algorithms[(idx + 1) % algorithms.length].key);
                    } else if (e.key === 'ArrowLeft') {
                      handleAlgorithmChange(algorithms[(idx - 1 + algorithms.length) % algorithms.length].key);
                    } else if (e.key === 'Home') {
                      handleAlgorithmChange(algorithms[0].key);
                    } else if (e.key === 'End') {
                      handleAlgorithmChange(algorithms[algorithms.length - 1].key);
                    }
                  }
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAlgorithmChange('collaborative');
                  }
                }}
                className={selectedAlgorithm === 'collaborative' ? 'active' : ''}
                disabled={loading}
              >
                <div className="option-icon">👥</div>
                <div className="option-text">
                  <strong>Community</strong>
                  <span>What similar users enjoy</span>
                </div>
              </button>
              
              <button 
                role="tab"
                aria-selected={selectedAlgorithm === 'popular'}
                tabIndex={selectedAlgorithm === 'popular' ? 0 : -1}
                onClick={() => handleAlgorithmChange('popular')}
                onKeyDown={(e) => {
                  if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {
                    e.preventDefault();
                    const idx = algorithms.findIndex(a => a.key === selectedAlgorithm);
                    if (e.key === 'ArrowRight') {
                      handleAlgorithmChange(algorithms[(idx + 1) % algorithms.length].key);
                    } else if (e.key === 'ArrowLeft') {
                      handleAlgorithmChange(algorithms[(idx - 1 + algorithms.length) % algorithms.length].key);
                    } else if (e.key === 'Home') {
                      handleAlgorithmChange(algorithms[0].key);
                    } else if (e.key === 'End') {
                      handleAlgorithmChange(algorithms[algorithms.length - 1].key);
                    }
                  }
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAlgorithmChange('popular');
                  }
                }}
                className={selectedAlgorithm === 'popular' ? 'active' : ''}
                disabled={loading}
              >
                <div className="option-icon">🔥</div>
                <div className="option-text">
                  <strong>Trending</strong>
                  <span>What's hot right now</span>
                </div>
              </button>
            </div>
          </div>
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
              <h3>{selectedAnimeInfo.title}</h3>
              {selectedAnimeInfo.seasonData?.length > 0 && (
                <p>{selectedAnimeInfo.seasonData.length} season(s) detected</p>
              )}
            </div>
          )}
          <SeasonRoadmap
            activeSeason={season}
            onSelect={handleSeasonChange}
            disabled={loading}
            seasonData={selectedAnimeInfo.seasonData}
            title={selectedAnimeInfo.title ? `${selectedAnimeInfo.title} — Seasons` : undefined}
          />
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
                      <button onClick={() => handleAnimeClick(anime)} className="details-btn">Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
  .recommendations-page { min-height:100vh; background:${colors.bgDark}; display:flex; flex-direction:column; }
  .hero-wrap { position:relative; isolation:isolate; z-index:0; contain:content; }
  .post-start-wrapper { padding:2rem 0 6rem; background:${colors.bgDark}; opacity:0; transform: translateY(24px); filter: blur(2px); transition: opacity .5s ease, transform .5s ease, filter .5s ease; }
  .post-start-wrapper.reveal { opacity:1; transform:none; filter:none; }
  .recommendation-section { max-width:1300px; margin:0 auto; padding:2rem 2rem 4rem; }
  .section-title { font-size:2rem; margin:0 0 1.5rem; background:${gradients.accent}; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .rec-grid { display:grid; gap:1.75rem; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); }
  .rec-card { background:${colors.panel}; border:1px solid ${colors.panelBorder}; border-radius:16px; overflow:hidden; display:flex; flex-direction:column; position:relative; box-shadow:${shadows.card}; transition:.35s; }
  .rec-card:hover { transform:translateY(-6px); box-shadow:${shadows.cardHover}; }
  .poster { position:relative; aspect-ratio:3/4; background:#0e141f; cursor:pointer; }
  .poster img { width:100%; height:100%; object-fit:cover; display:block; }
  .no-img { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:.8rem; opacity:.6; }
  .info { padding:.9rem .95rem 1.2rem; display:flex; flex-direction:column; gap:.55rem; }
  .title { font-size:1rem; margin:0; line-height:1.3; }
  .genres { font-size:.65rem; letter-spacing:.5px; opacity:.65; text-transform:uppercase; }
  .actions { display:flex; gap:.5rem; margin-top:.25rem; }
  .details-btn { flex:1; background:#243249; border:1px solid #2e3d55; color:#fff; font-size:.7rem; letter-spacing:.5px; padding:.5rem .7rem; border-radius:8px; cursor:pointer; transition:.25s; }
  .details-btn:hover { background:#2e3d55; }
  .loading-small { padding:1rem; font-size:.9rem; opacity:.8; }
  .empty { padding:2rem 0; text-align:center; font-size:.9rem; opacity:.7; }

        .algorithm-selector {
          padding: 4rem 2rem;
          background: ${gradients.panel};
          text-align: center;
          color: white;
        }

        .algorithm-selector h3 {
          font-size: 2rem;
          margin-bottom: 3rem;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .algorithm-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .algorithm-options button {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 15px;
          padding: 2rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }

        .algorithm-options button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .algorithm-options button.active {
          border-color: ${colors.accentB};
          background: rgba(78, 205, 196, 0.2);
        }
  .transition-indicator { font-size:.7rem; letter-spacing:.5px; opacity:.6; margin-left:.75rem; }

        .algorithm-options button[disabled] { 
          opacity:0.5; 
          cursor:not-allowed; 
          filter:grayscale(0.3); 
        }

        .option-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .option-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .option-text strong {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .option-text span {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .status-banner { text-align:center; padding:0.75rem 1rem; font-size:0.85rem; letter-spacing:.5px; }
  .status-banner.warning { background:linear-gradient(90deg,#ffa94d22,#ff6b6b33); border-top:1px solid #ffa94d55; border-bottom:1px solid #ff6b6b55; }
  .status-banner.degraded { background:linear-gradient(90deg,#ff6b6b33,#4ecdc422); border-top:1px solid #ff6b6b66; border-bottom:1px solid #4ecdc466; }
        .status-banner.guest { background:linear-gradient(90deg,#4ecdc422,#ffffff11); border-top:1px solid #4ecdc455; border-bottom:1px solid #4ecdc455; }

        .skeleton-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.5rem; padding:2rem; max-width:1200px; margin:0 auto; }

  .profile-pill { max-width:1300px; margin:0 auto; padding:0 2rem 0.5rem; display:flex; align-items:center; gap:.5rem; opacity:.9; }
  .profile-pill .avatar { width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; background:#28364f; border:1px solid #2e3d55; }
  .profile-pill .name { font-size:.9rem; letter-spacing:.4px; margin-right:.5rem; }
  .profile-pill .badge { font-size:.7rem; padding:.2rem .45rem; border-radius:999px; border:1px solid #2e3d55; margin-left:.3rem; }
  .profile-pill .badge.verify { background:#1f2a3d; border-color:#30527a; color:#7cc4ff; }
  .profile-pill .badge.premium { background:#2a1f3d; border-color:#55307a; color:#d7a6ff; }
  .profile-pill .mini { margin-left:.4rem; font-size:.7rem; background:#243249; border:1px solid #2e3d55; color:#fff; padding:.25rem .5rem; border-radius:8px; cursor:pointer; }

        @media (max-width: 768px) {
          .algorithm-options {
            grid-template-columns: 1fr;
          }
          
          .algorithm-options button {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationsPage;