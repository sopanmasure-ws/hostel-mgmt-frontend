import { useEffect, useState } from 'react';
import cacheService from '../lib/services/cacheService';

/**
 * Custom hook for caching API data
 * @param {string} key - Cache key
 * @param {function} fetchFn - Async function to fetch data
 * @param {number} expiryTime - Cache expiry in ms (default: 5 min)
 * @param {string} storage - 'memory', 'local', or 'session' (default: 'memory')
 * @returns {object} { data, loading, error, refetch }
 */
type CacheStorage = 'memory' | 'local' | 'session';

export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  expiryTime: number = 5 * 60 * 1000,
  storage: CacheStorage = 'memory'
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await cacheService.getOrSet(key, fetchFn, expiryTime, storage);
      setData(result);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key]);

  const refetch = (): void => {
    cacheService.remove(key, storage);
    fetchData();
  };

  return { data, loading, error, refetch };
}

export default useCache;
