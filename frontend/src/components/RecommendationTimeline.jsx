import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const RecommendationTimeline = ({ recommendations, onAnimeClick, onWatchClick, play }) => {
  const timelineRef = useRef(null);
  const introTlRef = useRef(null);
  const cardsRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const liveRegionRef = useRef(null);

  useEffect(() => {
    if (!recommendations.length || !play) return;

    // Intro fade/slide animation for entire container (runs once when play flips true)
    introTlRef.current = gsap.timeline();
    introTlRef.current.from(timelineRef.current, {
      autoAlpha: 0,
      y: 50,
      scale: 0.98,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, [play, recommendations.length]);

  useEffect(() => {
    if (!recommendations.length || !play) return; // wait for explicit trigger

    const timeline = timelineRef.current;
    const cards = cardsRefs.current;

    // Create main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: timeline,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const newIndex = Math.floor(progress * (recommendations.length - 1));
          if (newIndex !== activeIndex && !isScrolling) {
            setActiveIndex(newIndex);
            animateToCard(newIndex);
          }
        }
      }
    });

    // Initial animation for cards
    gsap.set(cards, { 
      opacity: 0, 
      scale: 0.8, 
      rotationY: 45,
      z: -100
    });

    // Animate cards in sequence
    cards.forEach((card, index) => {
      gsap.to(card, {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        z: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "back.out(1.7)"
      });
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [recommendations, activeIndex, isScrolling, play]);

  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Card ${activeIndex + 1} of ${recommendations.length}`;
    }
  }, [activeIndex, recommendations.length]);

  const animateToCard = (index) => {
    setIsScrolling(true);
    const cards = cardsRefs.current;
    
    // Animate all cards
    cards.forEach((card, i) => {
      const isActive = i === index;
      const distance = Math.abs(i - index);
      
      gsap.to(card, {
        scale: isActive ? 1.1 : Math.max(0.7, 1 - distance * 0.1),
        opacity: isActive ? 1 : Math.max(0.3, 1 - distance * 0.2),
        z: isActive ? 50 : -distance * 20,
        rotationY: isActive ? 0 : (i < index ? -15 : 15),
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          if (i === index) setIsScrolling(false);
        }
      });
    });

    // Animate timeline background
    gsap.to(timelineRef.current, {
      background: `linear-gradient(135deg, ${getAnimeColor(recommendations[index])} 0%, #1a1a2e 100%)`,
      duration: 0.8,
      ease: "power2.out"
    });
  };

  const getAnimeColor = (anime) => {
    const colors = {
      'Action': '#ff6b6b',
      'Adventure': '#4ecdc4',
      'Comedy': '#ffe66d',
      'Drama': '#a8e6cf',
      'Fantasy': '#ff8b94',
      'Romance': '#ffaaa5',
      'Sci-Fi': '#88d8c0',
      'Thriller': '#ffd93d'
    };
    
    return colors[anime.genres?.[0]] || '#667eea';
  };

  const handleCardClick = (anime, index) => {
    setActiveIndex(index);
    animateToCard(index);
    if (onAnimeClick) onAnimeClick(anime);
  };

  const handleWatchClick = (anime, e) => {
    e.stopPropagation();
    
    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('div');
    
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255,255,255,0.6)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
    
    if (onWatchClick) onWatchClick(anime);
  };

  if (!recommendations.length) {
    return (
      <div className="loading-timeline">
        <div className="loading-spinner"></div>
        <p>Curating your perfect anime recommendations...</p>
      </div>
    );
  }

  return (
    <div className="recommendation-timeline" ref={timelineRef} style={{ opacity: 0 }}>
      <div className="sr-only" aria-live="polite" ref={liveRegionRef}></div>
      <div className="timeline-header">
        <h2>Your Personalized Anime Journey</h2>
        <div className="progress-indicator" role="group" aria-label="Recommendation progress">
          <div 
            className="progress-bar"
            style={{ width: `${((activeIndex + 1) / recommendations.length) * 100}%` }}
          />
          <span className="progress-text">
            {activeIndex + 1} of {recommendations.length}
          </span>
        </div>
      </div>

      <div className="timeline-container">
        <div className="timeline-line" />
        
        {recommendations.map((anime, index) => (
          <div
            key={anime._id}
            ref={el => cardsRefs.current[index] = el}
            className={`timeline-card ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleCardClick(anime, index)}
            role="article"
            aria-label={`${anime.title}. Match ${Math.round((anime.recommendationScore || anime.hybridScore || 0) * 100)}%. ${anime.genres.slice(0,3).join(', ')}`}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); handleCardClick(anime, index); } }}
            style={{
              '--delay': `${index * 0.1}s`,
              '--color': getAnimeColor(anime)
            }}
          >
            <div className="card-inner">
              <div className="card-image">
                <img src={anime.poster} alt={anime.title} />
                <div className="card-overlay">
                  <div className="rating">★ {anime.rating}</div>
                  <div className="year">{anime.year}</div>
                </div>
              </div>
              
              <div className="card-content">
                <h3 className="anime-title">{anime.title}</h3>
                <div className="genres">
                  {anime.genres.slice(0, 3).map(genre => (
                    <span key={genre} className="genre-tag">{genre}</span>
                  ))}
                </div>
                <p className="description">
                  {anime.description.length > 100 
                    ? `${anime.description.substring(0, 100)}...`
                    : anime.description
                  }
                </p>
                
                <div className="card-actions">
                  <button
                    className="watch-btn"
                    onClick={(e) => handleWatchClick(anime, e)}
                    aria-label={`Watch ${anime.title} episode 1`}
                  >
                    <span className="btn-icon">▶</span>
                    Watch Now
                  </button>
                  <div className="recommendation-score">
                    Match: {Math.round((anime.recommendationScore || anime.hybridScore || 0) * 100)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="timeline-connector">
              <div className="connector-dot" />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .recommendation-timeline {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .timeline-header {
          text-align: center;
          margin-bottom: 3rem;
          color: white;
        }

        .timeline-header h2 {
          font-size: 3rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #fff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .progress-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .progress-bar {
          height: 4px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
          border-radius: 2px;
          transition: width 0.6s ease;
          width: 200px;
        }

        .progress-text {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .timeline-container {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
        }

        .timeline-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.3) 100%);
          transform: translateX(-50%);
          border-radius: 2px;
        }

        .timeline-card {
          display: flex;
          margin-bottom: 4rem;
          perspective: 1000px;
          animation: cardFloat var(--delay) infinite alternate;
        }

        .timeline-card:nth-child(even) {
          flex-direction: row-reverse;
        }

        .timeline-card:nth-child(even) .card-inner {
          transform-origin: right center;
        }

        .card-inner {
          width: 500px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          transform-style: preserve-3d;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .card-inner:hover {
          transform: rotateY(5deg) translateZ(20px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .timeline-card:nth-child(even) .card-inner:hover {
          transform: rotateY(-5deg) translateZ(20px);
        }

        .card-image {
          position: relative;
          height: 300px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .card-inner:hover .card-image img {
          transform: scale(1.1);
        }

        .card-overlay {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        .rating, .year {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 15px;
          font-size: 0.9rem;
        }

        .card-content {
          padding: 1.5rem;
        }

        .anime-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .genres {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .genre-tag {
          background: var(--color);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .watch-btn {
          background: linear-gradient(45deg, var(--color), #ff6b6b);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .watch-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        .recommendation-score {
          background: #f0f0f0;
          padding: 0.5rem 1rem;
          border-radius: 15px;
          font-size: 0.9rem;
          font-weight: bold;
          color: #333;
        }

        .timeline-connector {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        .connector-dot {
          width: 20px;
          height: 20px;
          background: var(--color);
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .timeline-card.active .connector-dot {
          transform: scale(1.5);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        .loading-timeline {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: white;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 2rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes cardFloat {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }

        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }

        @media (max-width: 768px) {
          .timeline-card {
            flex-direction: column !important;
          }
          
          .card-inner {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .timeline-line {
            display: none;
          }
          
          .timeline-connector {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationTimeline;