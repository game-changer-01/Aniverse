import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PosterImage({ title, src, alt, fill = true, sizes = '200px', style }) {
  const [url, setUrl] = useState(src || '');
  const [errored, setErrored] = useState(false);

  useEffect(() => { setUrl(src || ''); setErrored(false); }, [src]);

  useEffect(() => {
    if (url || !title) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`/api/images/search?q=${encodeURIComponent(title + ' anime poster')}`);
        if (!resp.ok) return;
        const data = await resp.json();
        const first = data.items?.[0]?.url;
        if (!cancelled && first) setUrl(first);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [title, url]);

  // If the domain isn't in next.config images.domains, Next Image will fail.
  // Strategy: try Next/Image first; on error, fall back to a plain <img> tag.
  if (url && !errored) {
    return (
      <Image
        src={url}
        alt={alt || title || 'Poster'}
        fill={fill}
        sizes={sizes}
        style={{ objectFit: 'cover', ...(style || {}) }}
        onError={() => setErrored(true)}
      />
    );
  }

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={alt || title || 'Poster'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{ e.currentTarget.style.display='none'; }} />
    );
  }

  return <div className="no-img">No Image</div>;
}
