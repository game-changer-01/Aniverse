import React, { useEffect, useRef, useState } from 'react';
import ThreeBackground from '../src/components/ThreeBackground';
import TopPopular from '../src/components/TopPopular';

const HomePage = () => {
  const videoRef = useRef(null);
  const playlist = React.useMemo(() => [
    '/video/hero-trailer1.mp4',
    '/video/hero-trailer2.mp4',
    '/video/hero-trailer3.mp4',
    '/video/hero-trailer4.mp4',
    '/video/hero-trailer5.mp4',
  ], []);
  const [videoIndex, setVideoIndex] = useState(() => Math.floor(Math.random() * 5));
  const currentVideoSrc = playlist[videoIndex];

  useEffect(() => {
    // Attempt play when loaded (mobile safari needs muted + playsInline + user interaction fallback)
    if (videoRef.current) {
      const v = videoRef.current;
      v.loop = false; // we'll loop via playlist
      const tryPlay = () => v.play().catch(err => {
        console.warn('Video autoplay blocked or failed:', err?.message);
      });
      if (v.readyState >= 2) tryPlay(); else v.addEventListener('loadeddata', tryPlay, { once:true });
      const interactionPlay = () => { v.play().catch(()=>{}); window.removeEventListener('click', interactionPlay); };
      window.addEventListener('click', interactionPlay);

      // Playlist advance handlers
      const onEnded = () => setVideoIndex(i => (i + 1) % playlist.length);
      const onError = () => setVideoIndex(i => (i + 1) % playlist.length);
      v.addEventListener('ended', onEnded);
      v.addEventListener('error', onError);

      return () => {
        v.removeEventListener('ended', onEnded);
        v.removeEventListener('error', onError);
        window.removeEventListener('click', interactionPlay);
      };
    }
  }, []);

  // When the src changes, reload and play next item in the playlist
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    const t = setTimeout(() => { v.play().catch(()=>{}); }, 0);
    return () => clearTimeout(t);
  }, [currentVideoSrc]);

  return (
    <div className="home-page">
      {/* Hero Section with Video Background */}
      <section className="hero-section">
        <div className="video-bg">
          <video ref={videoRef} className="bg-video" autoPlay muted playsInline preload="metadata">
            <source key={currentVideoSrc} src={currentVideoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-vignette" />
        </div>
        <div className="hero-content">
          {/* Empty hero - title moved below */}
        </div>
        <div className="hero-bottom-fade" />
      </section>

      {/* Top Popular Anime Section */}
      <section className="top-popular-section">
        <div className="section-header">
          <h1 className="section-title">Top Popular Anime</h1>
          <p className="section-subtitle">Discover the most beloved anime series from Japan</p>
        </div>
        <TopPopular />
      </section>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: var(--color-bg);
          color: var(--color-text);
          position: relative;
        }

        .hero-section {
          position: relative;
          min-height: 100vh;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-top: -80px;
          padding-top: 0;
        }

        .video-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: none;
        }

        .video-vignette {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.3) 0%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.4) 85%,
            var(--color-bg) 100%
          );
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 1200px;
          padding: 0 2rem;
        }

        .hero-bottom-fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 200px;
          background: linear-gradient(180deg, transparent 0%, var(--color-bg) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .top-popular-section {
          position: relative;
          z-index: 3;
          max-width: 1600px;
          margin: 0 auto;
          padding: 4rem 1.5rem 6rem;
          background: var(--color-bg);
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-top: 1rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 900;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #5856d6 0%, #dd2a7b 50%, #ffd700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 500;
          margin: 0;
          font-family: 'Japan Ramen', 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .hero-section {
            min-height: 85vh;
          }

          .section-header {
            margin-bottom: 2rem;
            padding-top: 0.5rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .section-subtitle {
            font-size: 0.9rem;
            letter-spacing: 1.5px;
          }

          .top-popular-section {
            padding: 3rem 1rem 4rem;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            min-height: 70vh;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .section-subtitle {
            font-size: 0.75rem;
          }

          .top-popular-section {
            padding: 2rem 1rem 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;