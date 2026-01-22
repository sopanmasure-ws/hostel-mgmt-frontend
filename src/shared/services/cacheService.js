// Centralized cache management service for the application
// Handles localStorage, sessionStorage, and in-memory caching

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * Set cache with optional expiry time
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} expiryTime - Expiry time in milliseconds (0 = no expiry)
   * @param {string} storage - 'memory', 'local', or 'session'
   */
  set(key, value, expiryTime = 5 * 60 * 1000, storage = 'memory') {
    try {
      if (storage === 'memory') {
        this.memoryCache.set(key, value);
        if (expiryTime > 0) {
          this.cacheExpiry.set(key, Date.now() + expiryTime);
        }
      } else if (storage === 'local') {
        const cacheData = {
          value,
          expiry: expiryTime > 0 ? Date.now() + expiryTime : null,
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
      } else if (storage === 'session') {
        const cacheData = {
          value,
          expiry: expiryTime > 0 ? Date.now() + expiryTime : null,
        };
        sessionStorage.setItem(key, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @param {string} storage - 'memory', 'local', or 'session'
   * @returns {any} Cached value or null
   */
  get(key, storage = 'memory') {
    try {
      if (storage === 'memory') {
        const expiry = this.cacheExpiry.get(key);
        if (expiry && Date.now() > expiry) {
          this.memoryCache.delete(key);
          this.cacheExpiry.delete(key);
          return null;
        }
        return this.memoryCache.get(key) || null;
      } else if (storage === 'local') {
        const data = localStorage.getItem(key);
        if (data) {
          const { value, expiry } = JSON.parse(data);
          if (expiry && Date.now() > expiry) {
            localStorage.removeItem(key);
            return null;
          }
          return value;
        }
      } else if (storage === 'session') {
        const data = sessionStorage.getItem(key);
        if (data) {
          const { value, expiry } = JSON.parse(data);
          if (expiry && Date.now() > expiry) {
            sessionStorage.removeItem(key);
            return null;
          }
          return value;
        }
      }
      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove specific cache
   * @param {string} key - Cache key
   * @param {string} storage - 'memory', 'local', or 'session'
   */
  remove(key, storage = 'memory') {
    try {
      if (storage === 'memory') {
        this.memoryCache.delete(key);
        this.cacheExpiry.delete(key);
      } else if (storage === 'local') {
        localStorage.removeItem(key);
      } else if (storage === 'session') {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Cache remove error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache of specific type
   * @param {string} storage - 'memory', 'local', or 'session'
   */
  clear(storage = 'memory') {
    try {
      if (storage === 'memory') {
        this.memoryCache.clear();
        this.cacheExpiry.clear();
      } else if (storage === 'local') {
        localStorage.clear();
      } else if (storage === 'session') {
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Check if cache exists and is valid
   * @param {string} key - Cache key
   * @param {string} storage - 'memory', 'local', or 'session'
   * @returns {boolean}
   */
  has(key, storage = 'memory') {
    return this.get(key, storage) !== null;
  }

  /**
   * Get or set cache (lazy loading pattern)
   * @param {string} key - Cache key
   * @param {function} fetchFn - Function to fetch data if not cached
   * @param {number} expiryTime - Expiry time in milliseconds
   * @param {string} storage - 'memory', 'local', or 'session'
   * @returns {Promise<any>}
   */
  async getOrSet(key, fetchFn, expiryTime = 5 * 60 * 1000, storage = 'memory') {
    const cached = this.get(key, storage);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetchFn();
      this.set(key, data, expiryTime, storage);
      return data;
    } catch (error) {
      console.error(`Error fetching data for cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      localSize: localStorage.length,
      sessionSize: sessionStorage.length,
      expiredCount: this.cacheExpiry.size,
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
