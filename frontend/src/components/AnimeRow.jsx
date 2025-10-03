import React from 'react';
import AnimeCard from './AnimeCard';

export default function AnimeRow({ title, animes }) {
  return (
    <section className="anime-row-section">
      <h2 className="row-title">{title}</h2>
      <div className="anime-grid">
        {animes.map(a => <AnimeCard key={a._id} anime={a} />)}
      </div>
      <style jsx>{`
        .anime-row-section {
          margin-bottom:3rem;
          max-width:1600px;
          margin-left:auto;
          margin-right:auto;
          padding:0 1.5rem;
        }
        .row-title {
          color:var(--color-text);
          margin:0 0 1.5rem;
          font-size:1.75rem;
          font-weight:700;
          background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .anime-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:1.75rem;
        }
        @media(max-width:1400px){.anime-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:1100px){.anime-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:700px){.anime-grid{grid-template-columns:repeat(1,1fr)}}
      `}</style>
    </section>
  );
}