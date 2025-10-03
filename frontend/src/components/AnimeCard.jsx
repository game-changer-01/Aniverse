import React from 'react';
import Link from 'next/link';
import PosterImage from './PosterImage';

export default function AnimeCard({ anime }) {
  return (
    <Link href={`/anime/${anime._id}`}>
      <a className="anime-card">
        <div className="card-poster">
          <PosterImage src={anime.poster} alt={anime.title} title={anime.title} />
        </div>
        <div className="card-meta">
          <p className="card-title">{anime.title}</p>
          {anime.genres && anime.genres.length > 0 && (
            <p className="card-genres">{anime.genres.slice(0,3).join(', ')}</p>
          )}
        </div>
        <style jsx>{`
          .anime-card {
            display: block;
            text-decoration: none;
            color: var(--color-text);
            background:var(--color-surface);
            border:2px solid var(--color-border);
            border-radius:16px;
            overflow:hidden;
            transition:all .4s cubic-bezier(.4,0,.2,1);
            position:relative;
            box-shadow:0 4px 20px rgba(0,0,0,0.2);
          }
          .anime-card:hover {
            transform:translateY(-8px) scale(1.02);
            border-color:var(--luxury-gold);
            box-shadow:0 20px 60px rgba(227,199,112,0.4), 0 0 0 1px var(--luxury-gold);
          }
          .anime-card::before {
            content:'';
            position:absolute;
            inset:-2px;
            background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));
            opacity:0;
            border-radius:inherit;
            transition:opacity 0.4s;
            z-index:-1;
          }
          .anime-card:hover::before {
            opacity:0.15;
          }
          .card-poster {
            aspect-ratio:3/4;
            background:linear-gradient(135deg,rgba(227,199,112,0.1),rgba(221,42,123,0.1));
            overflow:hidden;
            position:relative;
          }
          .card-poster :global(img) {
            transition:transform .3s ease;
          }
          .anime-card:hover .card-poster :global(img) {
            transform:scale(1.1);
          }
          .card-meta {
            padding:1rem 1.25rem;
          }
          .card-title {
            margin:0 0 .5rem;
            font-weight: 600;
            font-size:1.05rem;
            color: var(--color-text);
            line-height:1.4;
          }
          .card-genres {
            margin:0;
            font-size:0.9rem;
            color:var(--color-text-dim);
            opacity:0.7;
          }
        `}</style>
      </a>
    </Link>
  );
}