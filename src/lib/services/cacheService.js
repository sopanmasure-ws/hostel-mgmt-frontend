
class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.cacheExpiry = new Map();
  }
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

  has(key, storage = 'memory') {
    return this.get(key, storage) !== null;
  }
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
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      localSize: localStorage.length,
      sessionSize: sessionStorage.length,
      expiredCount: this.cacheExpiry.size,
    };
  }
}

export const cacheService = new CacheService();
export default cacheService;
