import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PosterImage({ title, src, alt, fill = true, sizes = '200px', style }) {
  const [url, setUrl] = useState(src || '');
  const [errored, setErrored] = useState(false);

  useEffect(() => { setUrl(src || ''); setErrored(false); }, [src]);
  // Note: No Google CSE fallback; if no URL, show a simple placeholder box

  // If the domain isn't in next.config images.domains, Next Image will fail.
  // Strategy: try Next/Image first; on error, fall back to a plain <img> tag.
  if (url && !errored) {
    return (
      <span className="pi-wrap">
        <Image
          src={url}
          alt={alt || title || 'Poster'}
          fill={fill}
          sizes={sizes}
          style={{ objectFit: 'cover', ...(style || {}) }}
          // Disable Next.js image optimization to avoid dev-time optimizer fetch errors
          // that can trigger error overlays and interfere with the hero trailer.
          unoptimized
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
        />
        <style jsx>{`
          .pi-wrap { position: relative; display: block; width: 100%; height: 100%; }
        `}</style>
      </span>
    );
  }

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={alt || title || 'Poster'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" onError={() => { setErrored(true); setUrl(''); }} />
    );
  }

  return <div className="no-img">No Image
    <style jsx>{`
      .no-img { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#0e141f; color:#6b7280; font-size:.8rem; border:1px solid #28344d; border-radius:8px; }
    `}</style>
  </div>;
}
