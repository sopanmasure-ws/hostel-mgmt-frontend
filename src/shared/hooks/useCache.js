import { useEffect, useState } from 'react';
import cacheService from '../services/cacheService';

/**
 * Custom hook for caching API data
 * @param {string} key - Cache key
 * @param {function} fetchFn - Async function to fetch data
 * @param {number} expiryTime - Cache expiry in ms (default: 5 min)
 * @param {string} storage - 'memory', 'local', or 'session' (default: 'memory')
 * @returns {object} { data, loading, error, refetch }
 */
export function useCache(key, fetchFn, expiryTime = 5 * 60 * 1000, storage = 'memory') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await cacheService.getOrSet(key, fetchFn, expiryTime, storage);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key]);

  const refetch = () => {
    cacheService.remove(key, storage);
    fetchData();
  };

  return { data, loading, error, refetch };
}

export default useCache;
