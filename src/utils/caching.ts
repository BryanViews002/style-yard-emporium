// Caching utilities for API responses and computed values

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of items in cache

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Cache keys for different types of data
export const CACHE_KEYS = {
  PRODUCTS: "products",
  PRODUCT: (id: string) => `product:${id}`,
  CATEGORIES: "categories",
  USER_PROFILE: (userId: string) => `user:${userId}`,
  USER_ORDERS: (userId: string) => `orders:${userId}`,
  USER_WISHLIST: (userId: string) => `wishlist:${userId}`,
  SHIPPING_RATES: (country: string) => `shipping:${country}`,
  REVIEWS: (productId: string) => `reviews:${productId}`,
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  PRODUCTS: 10 * 60 * 1000, // 10 minutes
  PRODUCT: 15 * 60 * 1000, // 15 minutes
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  SHIPPING_RATES: 60 * 60 * 1000, // 1 hour
  REVIEWS: 20 * 60 * 1000, // 20 minutes
} as const;

// Higher-order function for caching API calls
export const withCache = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl: number = CACHE_TTL.PRODUCTS
) => {
  const cache = CacheManager.getInstance();

  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);

    // Check cache first
    const cached = cache.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    cache.set(key, result, ttl);

    return result;
  };
};

// React hook for cached data fetching
export const useCachedData = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.PRODUCTS
) => {
  const cache = CacheManager.getInstance();

  const getCachedData = (): T | null => {
    return cache.get<T>(key);
  };

  const setCachedData = (data: T): void => {
    cache.set(key, data, ttl);
  };

  const invalidateCache = (): void => {
    cache.delete(key);
  };

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    hasCachedData: () => cache.has(key),
  };
};

// Utility for invalidating related cache entries
export const invalidateRelatedCache = (pattern: string): void => {
  const cache = CacheManager.getInstance();
  const stats = cache.getStats();

  // This is a simple implementation - in a real app you might want
  // to use a more sophisticated pattern matching system
  for (let i = 0; i < stats.size; i++) {
    const keys = Array.from(cache["cache"].keys());
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
  }
};

export default CacheManager;
