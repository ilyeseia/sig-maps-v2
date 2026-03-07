// @ts-nocheck
import Redis from 'ioredis';

// Redis Client singleton
let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(
      process.env.REDIS_URL || 'redis://redis:6379',
      {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      }
    );

    // Handle connection errors
    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    // Log successful connection
    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  return redisClient;
};

// Cache interface
export interface CacheOptions {
  expiresInSeconds?: number;
}

/**
 * Get value from cache
 */
export const cacheGet = async <T = unknown>(
  key: string
): Promise<T | null> => {
  try {
    const redis = getRedisClient();
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    // If Redis fails, return null (continue without cache)
    console.warn('Cache get error:', error);
    return null;
  }
};

/**
 * Set value in cache
 */
export const cacheSet = async (
  key: string,
  value: unknown,
  options: CacheOptions = {}
): Promise<boolean> => {
  try {
    const redis = getRedisClient();
    const serialized = JSON.stringify(value);

    if (options.expiresInSeconds) {
      await redis.setex(key, options.expiresInSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }

    return true;
  } catch (error) {
    console.warn('Cache set error:', error);
    return false;
  }
};

/**
 * Delete value from cache
 */
export const cacheDelete = async (key: string): Promise<boolean> => {
  try {
    const redis = getRedisClient();
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn('Cache delete error:', error);
    return false;
  }
};

/**
 * Delete multiple keys matching a pattern
 */
export const cacheDeletePattern = async (pattern: string): Promise<number> => {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    await redis.del(keys);
    return keys.length;
  } catch (error) {
    console.warn('Cache delete pattern error:', error);
    return 0;
  }
};

/**
 * Invalidate cache for a specific layer
 */
export const invalidateLayerCache = async (layerId: string): Promise<void> => {
  // Invalidate cache for this layer
  await cacheDelete(`layer:${layerId}`);
  await cacheDeletePattern(`features:layer:${layerId}*`);
};

/**
 * Invalidate all layer caches
 */
export const invalidateAllLayerCaches = async (): Promise<number> => {
  return await cacheDeletePattern('layer:*');
};

/**
 * Invalidate all feature caches
 */
export const invalidateAllFeatureCaches = async (): Promise<number> => {
  return await cacheDeletePattern('features:*');
};

/**
 * Close Redis connection (for graceful shutdown)
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
