export function debounce<T extends (...args: any[]) => void>(func: T, delay: number = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}


export function throttle<T extends (...args: any[]) => void>(func: T, limit: number = 300) {
  let inThrottle = false;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function memoize<T extends (...args: any[]) => any>(func: T) {
  const cache = new Map<string, ReturnType<T>>();
  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

export class BatchProcessor<T> {
  private processFn: (items: T[]) => void;
  private batchSize: number;
  private delayMs: number;
  private queue: T[];
  private timeoutId: ReturnType<typeof setTimeout> | null;

  constructor(processFn: (items: T[]) => void, batchSize: number = 10, delayMs: number = 100) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.delayMs = delayMs;
    this.queue = [];
    this.timeoutId = null;
  }

  add(item: T) {
    this.queue.push(item);
    if (this.queue.length >= this.batchSize) {
      this.process();
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.process(), this.delayMs);
    }
  }

  process(): void {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.batchSize);
    this.processFn(batch);
    this.timeoutId = null;
  }

  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.process();
  }
}

export function lazyLoad(callback: (target: Element) => void, options: IntersectionObserverInit = {}) {
  const defaultOptions: IntersectionObserverInit = {
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
export function shallowEqual(obj1: Record<string, unknown>, obj2: Record<string, unknown>) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
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
