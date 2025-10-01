import '../src/styles/global.css';
import Layout from '../src/components/Layout';
import { ToastProvider } from '../src/components/ToastProvider';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import anime from 'animejs';

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  const router = useRouter();
  const overlayRef = useRef(null);

  useEffect(() => {
    const start = () => {
      if (!overlayRef.current) return;
      overlayRef.current.style.pointerEvents = 'auto';
      anime({ targets: overlayRef.current, opacity: [0, 1], duration: 180, easing: 'easeOutQuad' });
    };
    const done = () => {
      if (!overlayRef.current) return;
      anime({
        targets: overlayRef.current,
        opacity: [1, 0],
        duration: 280,
        easing: 'easeInQuad',
        complete: () => { if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none'; },
      });
    };
    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router.events]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Script src="https://accounts.google.com/gsi/client" async defer strategy="afterInteractive" />
          <div ref={overlayRef} aria-hidden className="route-overlay" />
          {getLayout(<Component {...pageProps} />)}
          <style jsx global>{`
            .route-overlay { position:fixed; inset:0; background:var(--color-glass); backdrop-filter:blur(8px); z-index:9999; opacity:0; pointer-events:none; }
          `}</style>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}