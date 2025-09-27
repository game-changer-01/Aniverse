import useSWR from 'swr';
import axios from 'axios';

const fetcher = async (url) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(url, { headers });
    return res.data;
  } catch (e) {
    // fallback to static client JSON
    try {
      const res = await fetch('/data/static-fallback.json');
      const recommendations = await res.json();
      return {
        recommendations,
        algorithm: 'static-local',
        degraded: true,
        warning: 'Network error. Showing offline static selection.'
      };
    } catch (e2) {
      throw e; // bubble original error if even static fails
    }
  }
};

export function useRecommendations(algorithm, season, enabled) {
  const key = enabled ? `/api/recommend?algorithm=${algorithm}&limit=20&season=${season}` : null;
  const swr = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15_000,
    keepPreviousData: true,
  });
  return swr;
}
