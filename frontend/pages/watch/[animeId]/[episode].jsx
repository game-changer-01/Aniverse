import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { gsap } from 'gsap';
import axios from 'axios';

const WatchPage = () => {
  const router = useRouter();
  const { animeId, episode } = router.query;
  const [watchData, setWatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (animeId && episode) {
      fetchWatchData();
    }
  }, [animeId, episode]);

  useEffect(() => {
    if (watchData) {
      initializePlayer();
    }
  }, [watchData]);

  const fetchWatchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Get session ID from URL or generate one
      const sessionId = new URLSearchParams(window.location.search).get('session') || 
                       localStorage.getItem('watchSession') || 
                       generateSessionId();
      
      localStorage.setItem('watchSession', sessionId);

      const response = await axios.get(
        `/api/watch/${animeId}/episode/${episode}?sessionId=${sessionId}`,
        { headers }
      );

      setWatchData(response.data);
    } catch (error) {
      console.error('Error fetching watch data:', error);
      setError('Failed to load video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initializePlayer = () => {
    const video = videoRef.current;
    const container = playerRef.current;
    
    if (!video || !container) return;

    // Create custom video player with GSAP animations
    gsap.fromTo(container, 
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
    );

    // Video event listeners
    video.addEventListener('loadedmetadata', () => {
      // Restore previous watch progress if available
      const savedProgress = localStorage.getItem(`progress_${animeId}_${episode}`);
      if (savedProgress) {
        video.currentTime = parseFloat(savedProgress);
      }
    });

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleVideoEnd);

    // Cleanup
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleVideoEnd);
    };
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const progress = video.currentTime;
    setWatchProgress(progress);

    // Save progress locally
    localStorage.setItem(`progress_${animeId}_${episode}`, progress.toString());

    // Update progress on server (throttled)
    if (Math.floor(progress) % 30 === 0) { // Every 30 seconds
      updateServerProgress(progress);
    }
  };

  const handleVideoEnd = () => {
    const video = videoRef.current;
    if (!video) return;

    // Mark as completed
    updateServerProgress(video.duration, true);

    // Auto-play next episode if available
    if (watchData.nextEpisode) {
      setTimeout(() => {
        router.push(`/watch/${animeId}/${watchData.nextEpisode.number}`);
      }, 3000);
    }
  };

  const updateServerProgress = async (progress, completed = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(`/api/watch/${animeId}/episode/${episode}/progress`, {
        progress,
        completed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const navigateToEpisode = (episodeNumber) => {
    router.push(`/watch/${animeId}/${episodeNumber}`);
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  if (loading) {
    return (
      <div className="watch-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading your anime...</h2>
          <p>Preparing the best viewing experience</p>
        </div>

        <style jsx>{`
          .watch-loading {
            height: 100vh;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .loading-content {
            text-align: center;
          }

          .loading-spinner {
            width: 60px;
            height: 60px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #ff6b6b;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 2rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watch-error">
        <div className="error-content">
          <h2>Unable to load video</h2>
          <p>{error}</p>
          <button onClick={fetchWatchData}>Try Again</button>
          <button onClick={() => router.push('/recommendations')}>
            Back to Recommendations
          </button>
        </div>

        <style jsx>{`
          .watch-error {
            height: 100vh;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
          }

          .error-content button {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border: none;
            padding: 1rem 2rem;
            border-radius: 25px;
            color: white;
            margin: 0 0.5rem;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="watch-page">
      <div className="video-container" ref={playerRef}>
        <video
          ref={videoRef}
          src={watchData?.streamUrl}
          controls
          autoPlay
          className="main-video"
          poster={watchData?.episode?.thumbnail}
        />
        
        {/* Custom Controls Overlay */}
        <div className="video-overlay">
          <div className="video-info">
            <h1>{watchData?.anime?.title}</h1>
            <h2>Episode {watchData?.episode?.number}: {watchData?.episode?.title}</h2>
          </div>
          
          <div className="episode-navigation">
            {watchData?.prevEpisode && (
              <button 
                className="nav-btn prev"
                onClick={() => navigateToEpisode(watchData.prevEpisode.number)}
              >
                ← Previous Episode
              </button>
            )}
            
            {watchData?.nextEpisode && (
              <button 
                className="nav-btn next"
                onClick={() => navigateToEpisode(watchData.nextEpisode.number)}
              >
                Next Episode →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Anime Info Sidebar */}
      <div className="anime-info">
        <div className="anime-poster">
          <img src={watchData?.anime?.poster} alt={watchData?.anime?.title} />
        </div>
        
        <div className="anime-details">
          <h3>{watchData?.anime?.title}</h3>
          <div className="anime-meta">
            <span className="rating">★ {watchData?.anime?.rating}</span>
            <span className="episodes">{watchData?.anime?.totalEpisodes} Episodes</span>
          </div>
          
          <div className="genres">
            {watchData?.anime?.genres?.map(genre => (
              <span key={genre} className="genre-tag">{genre}</span>
            ))}
          </div>
          
          <p className="description">{watchData?.anime?.description}</p>
          
          <button 
            className="back-btn"
            onClick={() => router.push('/recommendations')}
          >
            Back to Recommendations
          </button>
        </div>
      </div>

      <style jsx>{`
        .watch-page {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          color: white;
        }

        .video-container {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }

        .main-video {
          width: 100%;
          max-width: 1200px;
          height: auto;
          outline: none;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.7) 0%,
            transparent 20%,
            transparent 80%,
            rgba(0,0,0,0.7) 100%
          );
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2rem;
        }

        .video-info h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }

        .video-info h2 {
          font-size: 1.25rem;
          opacity: 0.9;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }

        .episode-navigation {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .nav-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          pointer-events: all;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .anime-info {
          width: 350px;
          background: #1a1a1a;
          padding: 2rem;
          overflow-y: auto;
        }

        .anime-poster {
          margin-bottom: 2rem;
        }

        .anime-poster img {
          width: 100%;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .anime-details h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #ff6b6b;
        }

        .anime-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .rating, .episodes {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.9rem;
        }

        .genres {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .genre-tag {
          background: #4ecdc4;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
        }

        .description {
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .back-btn {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 25px;
          cursor: pointer;
          width: 100%;
          font-weight: 600;
          transition: transform 0.3s ease;
        }

        .back-btn:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .watch-page {
            flex-direction: column;
          }
          
          .anime-info {
            width: 100%;
            max-height: 40vh;
          }
          
          .video-overlay {
            padding: 1rem;
          }
          
          .video-info h1 {
            font-size: 1.5rem;
          }
          
          .episode-navigation {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default WatchPage;