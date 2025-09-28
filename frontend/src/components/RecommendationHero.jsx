import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const RecommendationHero = ({ user, onStartRecommendations, showStartCta = false }) => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const particlesRef = useRef([]);
  const videoRef = useRef(null);
  const playlist = React.useMemo(() => [
    '/video/hero-trailer.mp4',
    '/video/hero-trailer2.mp4',
    '/video/hero-trailer3.mp4',
  ], []);
  const [videoIndex, setVideoIndex] = useState(0);
  const currentVideoSrc = playlist[videoIndex];
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Removed particle creation per new design (clean video background)
    
    // Main hero animation timeline
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animate title with typewriter effect
    tl.from(titleRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out"
    })
    .to(titleRef.current, {
      text: {
        value: user ? `Welcome back, ${user.username}!` : "Discover Your Next Favorite Anime",
        delimiter: ""
      },
      duration: 2,
      ease: "none"
    }, "-=0.5")
    .from(subtitleRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out"
    }, "-=1")
    .add(() => setIsLoaded(true));

    // Parallax effect on scroll
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.to(heroRef.current, {
          y: progress * 200,
          scale: 1 + progress * 0.2,
          duration: 0.3
        });
      }
    });

    // attempt play when loaded (mobile safari needs muted + playsInline + user interaction fallback)
    if (videoRef.current) {
      const v = videoRef.current;
      v.loop = false; // we'll loop via playlist
      const tryPlay = () => v.play().catch(err => {
        // Will attempt again after first user interaction
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

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [user]);

  // When the src changes, reload and play next item in the playlist
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Force reload new source and try to play
    v.load();
    const t = setTimeout(() => { v.play().catch(()=>{}); }, 0);
    return () => clearTimeout(t);
  }, [currentVideoSrc]);

  // Removed createParticles function

  const handleGuestStart = () => {
    if (onStartRecommendations) onStartRecommendations();
  };
  const handleLogin = () => {
    router.push('/auth/login');
  };
  const handleSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <>
  <section className="recommendation-hero" ref={heroRef} aria-labelledby="hero-title">
        <div className="video-bg" aria-hidden="true">
          <video ref={videoRef} className="bg-video" autoPlay muted playsInline preload="metadata">
            <source key={currentVideoSrc} src={currentVideoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-vignette" />
        </div>
        <div className="hero-content">
          <h1 ref={titleRef} className="hero-title" id="hero-title"></h1>
          <p ref={subtitleRef} className="hero-subtitle">
            {user ? 'AI-powered recommendations based on your unique taste' : 'Let our AI find anime perfectly matched to your preferences'}
          </p>
          {isLoaded && (
            <div className="cta-row" role="group" aria-label="Get started options">
              {showStartCta && <button className="glass-btn primary" onClick={handleGuestStart} aria-label="Continue as guest and see recommendations">Start as Guest</button>}
              <button className="glass-btn" onClick={handleLogin} aria-label="Log in to personalize recommendations">Log in</button>
              <button className="glass-btn" onClick={handleSignup} aria-label="Create an account">Sign up</button>
            </div>
          )}
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">10,000+</span>
            <span className="stat-label">Anime Titles</span>
          </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Match Accuracy</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">New Updates</span>
            </div>
        </div>
        <div className="hero-bottom-fade" aria-hidden="true" />
      </section>
      <div className="section-break" />
      
      <style jsx>{`
  .recommendation-hero { position:relative; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; color:#fff; }
  .video-bg { position:absolute; inset:0; z-index:0; }
  .bg-video { width:100%; height:100%; object-fit:cover; background:none; }
  .video-vignette { position:absolute; inset:0; background:linear-gradient(180deg, rgba(10,10,20,0.35) 0%, rgba(10,10,20,0.55) 40%, rgba(10,10,20,0.85) 75%, #0b0b0f 100%); pointer-events:none; }
  .hero-bottom-fade { position:absolute; left:0; right:0; bottom:-1px; height:160px; background:linear-gradient(180deg, rgba(11,11,15,0) 0%, #0b0b0f 75%); z-index:1; pointer-events:none; }
  .section-break { height:48px; background:#0b0b0f; }
        .hero-content { position:relative; z-index:2; text-align:center; max-width:800px; padding:0 2rem; }
        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          margin-bottom: 1.5rem;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 6s ease-in-out infinite;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .cta-row { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
        .glass-btn { position:relative; appearance:none; border:1px solid rgba(255,255,255,0.18); background:radial-gradient(120% 120% at 10% 10%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.03) 100%); color:#fff; padding:0.9rem 1.4rem; border-radius:16px; font-weight:600; letter-spacing:.3px; cursor:pointer; transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 8px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .glass-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 34px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.28); }
        .glass-btn.primary { border-color: rgba(78,205,196,0.5); background: linear-gradient(135deg, rgba(78,205,196,0.35), rgba(69,183,209,0.22)); box-shadow: 0 10px 30px rgba(78,205,196,0.25), inset 0 1px 0 rgba(255,255,255,0.2); }
        .glass-btn.primary:hover { box-shadow: 0 14px 36px rgba(78,205,196,0.35), inset 0 1px 0 rgba(255,255,255,0.25); }

        .hero-stats {
          position:relative;
          z-index:2;
          display:flex;
          gap: 3rem;
          margin-top: 4rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #4ecdc4;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

  /* Particle and countdown styles removed */

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* float animation removed */

  @keyframes pulse { 0% { transform:scale(0.4); opacity:0;} 40% {opacity:1;} 100% { transform:scale(1); opacity:0;} }

        @media (max-width: 768px) {
          .hero-stats {
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .stat-item {
            padding: 0 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default RecommendationHero;