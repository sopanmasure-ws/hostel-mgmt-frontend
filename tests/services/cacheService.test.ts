import cacheService from '../../src/lib/services/cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    cacheService.clear('memory');
  });

  describe('Memory Cache', () => {
    it('should set and get value from memory cache', () => {
      const key = 'testKey';
      const value = { data: 'test' };

      cacheService.set(key, value, 10000, 'memory');
      const result = cacheService.get(key, 'memory');

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', () => {
      const result = cacheService.get('nonExistent', 'memory');
      expect(result).toBeNull();
    });

    it('should remove value from memory cache', () => {
      const key = 'testKey';
      cacheService.set(key, 'value', 10000, 'memory');

      cacheService.remove(key, 'memory');

      const result = cacheService.get(key, 'memory');
      expect(result).toBeNull();
    });

    it('should clear all memory cache', () => {
      cacheService.set('key1', 'value1', 10000, 'memory');
      cacheService.set('key2', 'value2', 10000, 'memory');

      cacheService.clear('memory');

      expect(cacheService.get('key1', 'memory')).toBeNull();
      expect(cacheService.get('key2', 'memory')).toBeNull();
    });

    it('should check if key exists in cache', () => {
      const key = 'testKey';
      expect(cacheService.has(key, 'memory')).toBe(false);

      cacheService.set(key, 'value', 10000, 'memory');
      expect(cacheService.has(key, 'memory')).toBe(true);
    });
  });

  describe('LocalStorage Cache', () => {
    it('should set and get value from localStorage', () => {
      const key = 'testKey';
      const value = { data: 'test' };

      cacheService.set(key, value, 10000, 'local');
      const result = cacheService.get(key, 'local');

      expect(result).toEqual(value);
    });

    it('should return null for expired localStorage item', (done) => {
      const key = 'testKey';
      cacheService.set(key, 'value', 50, 'local'); // 50ms expiry

      setTimeout(() => {
        const result = cacheService.get(key, 'local');
        expect(result).toBeNull();
        done();
      }, 100);
    });

    it('should remove from localStorage', () => {
      const key = 'testKey';
      cacheService.set(key, 'value', 10000, 'local');

      cacheService.remove(key, 'local');

      expect(cacheService.get(key, 'local')).toBeNull();
    });

    it('should clear localStorage', () => {
      cacheService.set('key1', 'value1', 10000, 'local');
      cacheService.set('key2', 'value2', 10000, 'local');

      cacheService.clear('local');

      expect(localStorage.length).toBe(0);
    });
  });

  describe('SessionStorage Cache', () => {
    it('should set and get value from sessionStorage', () => {
      const key = 'testKey';
      const value = { data: 'test' };

      cacheService.set(key, value, 10000, 'session');
      const result = cacheService.get(key, 'session');

      expect(result).toEqual(value);
    });

    it('should remove from sessionStorage', () => {
      const key = 'testKey';
      cacheService.set(key, 'value', 10000, 'session');

      cacheService.remove(key, 'session');

      expect(cacheService.get(key, 'session')).toBeNull();
    });
  });

  describe('getOrSet method', () => {
    it('should return cached value if available', async () => {
      const key = 'testKey';
      const cachedValue = 'cached';
      const fetchFn = jest.fn().mockResolvedValue('fresh');

      cacheService.set(key, cachedValue, 10000, 'memory');

      const result = await cacheService.getOrSet(key, fetchFn, 10000, 'memory');

      expect(result).toBe(cachedValue);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache if not available', async () => {
      const key = 'testKey';
      const freshValue = { data: 'fresh' };
      const fetchFn = jest.fn().mockResolvedValue(freshValue);

      const result = await cacheService.getOrSet(key, fetchFn, 10000, 'memory');

      expect(result).toEqual(freshValue);
      expect(fetchFn).toHaveBeenCalled();

      // Verify it was cached
      const cachedResult = cacheService.get(key, 'memory');
      expect(cachedResult).toEqual(freshValue);
    });

    it('should handle fetch function errors', async () => {
      const key = 'testKey';
      const error = new Error('Fetch error');
      const fetchFn = jest.fn().mockRejectedValue(error);

      await expect(cacheService.getOrSet(key, fetchFn, 10000, 'memory')).rejects.toThrow(
        'Fetch error'
      );
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      cacheService.clear();
    });

    it('should return empty stats when cache is empty', () => {
      const stats = cacheService.getStats();
      
      expect(stats.memorySize).toBe(0);
      expect(stats.localSize).toBeGreaterThanOrEqual(0);
      expect(stats.sessionSize).toBeGreaterThanOrEqual(0);
      expect(stats.expiredCount).toBeGreaterThanOrEqual(0);
    });

    it('should return correct memory size count', () => {
      cacheService.set('key1', { data: 'value1' }, 60000, 'memory');
      cacheService.set('key2', { data: 'value2' }, 60000, 'memory');
      cacheService.set('key3', { data: 'value3' }, 60000, 'memory');

      const stats = cacheService.getStats();
      
      expect(stats.memorySize).toBe(3);
    });

    it('should track localStorage size', () => {
      const initialLocalSize = localStorage.length;
      
      cacheService.set('key1', { data: 'test' }, 60000, 'local');
      cacheService.set('key2', { value: 123 }, 60000, 'local');

      const stats = cacheService.getStats();
      
      expect(stats.localSize).toBeGreaterThan(initialLocalSize);
    });

    it('should track sessionStorage size', () => {
      const initialSessionSize = sessionStorage.length;
      
      cacheService.set('key1', { data: 'test' }, 60000, 'session');

      const stats = cacheService.getStats();
      
      expect(stats.sessionSize).toBeGreaterThan(initialSessionSize);
    });

    it('should track expired entries count', () => {
      cacheService.set('key1', { data: 'value' }, 60000, 'memory');

      const stats = cacheService.getStats();
      
      // expiredCount tracks the cacheExpiry map size
      expect(stats.expiredCount).toBeGreaterThanOrEqual(0);
      expect(typeof stats.expiredCount).toBe('number');
    });

    it('should update stats after clear', () => {
      cacheService.set('key1', { data: 'value1' }, 60000, 'memory');
      cacheService.set('key2', { data: 'value2' }, 60000, 'memory');
      
      cacheService.clear();
      
      const stats = cacheService.getStats();
      
      expect(stats.memorySize).toBe(0);
    });

    it('should return all stats properties', () => {
      const stats = cacheService.getStats();
      
      expect(stats).toHaveProperty('memorySize');
      expect(stats).toHaveProperty('localSize');
      expect(stats).toHaveProperty('sessionSize');
      expect(stats).toHaveProperty('expiredCount');
    });
  });
});
