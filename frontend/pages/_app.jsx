import '../src/styles/global.css';
import Layout from '../src/components/Layout';
import { ToastProvider } from '../src/components/ToastProvider';
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return (
    <ToastProvider>
      <Script src="https://accounts.google.com/gsi/client" async defer strategy="afterInteractive" />
      {getLayout(<Component {...pageProps} />)}
    </ToastProvider>
  );
}