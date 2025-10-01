import React from 'react';
import Link from 'next/link';

export default function AnimeCard({ anime }) {
  return (
    <Link href={`/anime/${anime._id}`}>
      <a className="anime-card">
        <div className="card-image">
          <img src={anime.poster} alt={anime.title} />
        </div>
        <p className="card-title">{anime.title}</p>
        <style jsx>{`
          .anime-card {
            display: block;
            width: 180px;
            text-decoration: none;
            color: var(--color-text);
            margin-right: 16px;
          }
          .card-image {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 20px var(--color-shadow);
            transition: transform .2s ease;
          }
          .card-image:hover {
            transform: scale(1.05);
          }
          .card-image img {
            width: 100%;
            height: 260px;
            object-fit: cover;
          }
          .card-title {
            margin-top: 8px;
            font-weight: 600;
            text-align: center;
            color: var(--color-text);
          }
        `}</style>
      </a>
    </Link>
  );
}