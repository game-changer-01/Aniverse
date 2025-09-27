import React from 'react';
import AnimeCard from './AnimeCard';

export default function AnimeRow({ title, animes }) {
  return (
    <section style={{ marginBottom:40 }}>
      <h2 style={{ color:'#fff', margin:'0 0 16px 8px', fontSize:24 }}>{title}</h2>
      <div style={{ display:'flex', overflowX:'auto', padding:'0 8px' }}>
        {animes.map(a => <AnimeCard key={a._id} anime={a} />)}
      </div>
    </section>
  );
}