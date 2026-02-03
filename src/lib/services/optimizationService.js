
export function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}


export function throttle(func, limit = 300) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function memoize(func) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

export class BatchProcessor {
  constructor(processFn, batchSize = 10, delayMs = 100) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.delayMs = delayMs;
    this.queue = [];
    this.timeoutId = null;
  }

  add(item) {
    this.queue.push(item);
    if (this.queue.length >= this.batchSize) {
      this.process();
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.process(), this.delayMs);
    }
  }

  process() {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.batchSize);
    this.processFn(batch);
    this.timeoutId = null;
  }

  flush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.process();
  }
}

export function lazyLoad(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, defaultOptions);
}
export function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default {
  debounce,
  throttle,
  memoize,
  BatchProcessor,
  lazyLoad,
  shallowEqual,
  deepClone,
  chunkArray,
};
