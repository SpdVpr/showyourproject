/**
 * Simple in-memory cache for Firebase data to improve performance
 */

import { serializeFirebaseObject } from './utils/serialization';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds

    // Serialize Firebase objects to prevent toJSON method issues
    let serializedData = data;
    if (Array.isArray(data)) {
      serializedData = data.map(item =>
        typeof item === 'object' && item !== null ? serializeFirebaseObject(item) : item
      ) as T;
    } else if (typeof data === 'object' && data !== null) {
      serializedData = serializeFirebaseObject(data as any) as T;
    }

    this.cache.set(key, {
      data: serializedData,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const dataCache = new SimpleCache();

// Cache keys
export const CACHE_KEYS = {
  FEATURED_PROJECTS: 'featured_projects',
  NEW_PROJECTS: 'new_projects',
  ALL_PROJECTS: 'all_projects',
  CATEGORIES: 'categories',
  PROJECT_DETAIL: (id: string) => `project_${id}`,
  USER_PROJECTS: (userId: string) => `user_projects_${userId}`,
  POINTS_TRANSACTIONS: (userId: string) => `points_transactions_${userId}`,
} as const;

// Cache TTL in minutes
export const CACHE_TTL = {
  PROJECTS: 5, // 5 minutes for project lists
  PROJECT_DETAIL: 10, // 10 minutes for individual projects
  CATEGORIES: 30, // 30 minutes for categories (rarely change)
  USER_DATA: 2, // 2 minutes for user-specific data
} as const;

/**
 * Cached wrapper for async functions
 */
export function withCache<T extends any[], R>(
  cacheKey: string,
  ttlMinutes: number,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    // Generate dynamic cache key if needed
    const finalCacheKey = cacheKey || `${fn.name}_${JSON.stringify(args)}`;

    // Try to get from cache first
    const cached = dataCache.get<R>(finalCacheKey);
    if (cached !== null) {
      console.log(`Cache hit for: ${finalCacheKey}`);
      return cached;
    }

    // Cache miss - fetch data
    console.log(`Cache miss for: ${finalCacheKey}, fetching...`);
    const result = await fn(...args);

    // Store in cache
    dataCache.set(finalCacheKey, result, ttlMinutes);

    return result;
  };
}

/**
 * Cached wrapper with dynamic key generation
 */
export function withDynamicCache<T extends any[], R>(
  keyGenerator: (...args: T) => string,
  ttlMinutes: number,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const cacheKey = keyGenerator(...args);

    // Try to get from cache first
    const cached = dataCache.get<R>(cacheKey);
    if (cached !== null) {
      console.log(`Cache hit for: ${cacheKey}`);
      return cached;
    }

    // Cache miss - fetch data
    console.log(`Cache miss for: ${cacheKey}, fetching...`);
    const result = await fn(...args);

    // Store in cache
    dataCache.set(cacheKey, result, ttlMinutes);

    return result;
  };
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(pattern: string): void {
  const keys = Array.from(dataCache['cache'].keys());
  const keysToDelete = keys.filter(key => key.includes(pattern));
  
  keysToDelete.forEach(key => {
    dataCache.delete(key);
    console.log(`Invalidated cache: ${key}`);
  });
}

/**
 * Preload critical data into cache
 */
export async function preloadCriticalData(): Promise<void> {
  try {
    console.log('Preloading critical data...');
    
    // Import services dynamically to avoid circular dependencies
    const { projectService } = await import('./firebaseServices');
    
    // Preload featured projects (most important)
    if (!dataCache.has(CACHE_KEYS.FEATURED_PROJECTS)) {
      try {
        const featuredProjects = await projectService.getFeaturedProjects();
        dataCache.set(CACHE_KEYS.FEATURED_PROJECTS, featuredProjects.slice(0, 3), CACHE_TTL.PROJECTS);
        console.log('Preloaded featured projects');
      } catch (error) {
        console.warn('Failed to preload featured projects:', error);
      }
    }
    
    // Preload categories (lightweight)
    if (!dataCache.has(CACHE_KEYS.CATEGORIES)) {
      try {
        // Categories are usually static, so we can cache them longer
        const categories = [
          { id: '1', name: 'Web Apps', slug: 'web-apps', count: 0 },
          { id: '2', name: 'Mobile Apps', slug: 'mobile-apps', count: 0 },
          { id: '3', name: 'SaaS', slug: 'saas', count: 0 },
          { id: '4', name: 'E-commerce', slug: 'ecommerce', count: 0 },
          { id: '5', name: 'AI/ML', slug: 'ai-ml', count: 0 },
          { id: '6', name: 'Developer Tools', slug: 'developer-tools', count: 0 },
        ];
        dataCache.set(CACHE_KEYS.CATEGORIES, categories, CACHE_TTL.CATEGORIES);
        console.log('Preloaded categories');
      } catch (error) {
        console.warn('Failed to preload categories:', error);
      }
    }
    
  } catch (error) {
    console.error('Error preloading critical data:', error);
  }
}

// Auto cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    dataCache.cleanup();
  }, 5 * 60 * 1000);
}
