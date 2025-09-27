import React from 'react';
import Link from 'next/link';

export default function AnimeCard({ anime }) {
  return (
    <Link href={`/anime/${anime._id}`}>
      <a style={{
        display:'block', width:180, textDecoration:'none', color:'#fff',
        marginRight:16
      }}>
        <div style={{
          borderRadius:12,
          overflow:'hidden',
          boxShadow:'0 8px 20px rgba(0,0,0,0.4)',
          transition:'transform .2s ease'
        }}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
        >
          <img src={anime.poster} alt={anime.title} style={{ width:'100%', height:260, objectFit:'cover' }} />
        </div>
        <p style={{ marginTop:8, fontWeight:600, textAlign:'center' }}>{anime.title}</p>
      </a>
    </Link>
  );
}