/**
 * Redis Configuration
 * Используется для кэширования, хранения сессий, онлайн-пользователей и временных данных
 */

const Redis = require('ioredis');

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    console.log(`⏳ Redis reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
  lazyConnect: false,
});

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('ready', () => {
  console.log('✅ Redis ready');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redis.on('close', () => {
  console.log('⚠️  Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

/**
 * Redis Helper Methods
 */

// Set value with optional TTL
const setWithTTL = async (key, value, ttlSeconds = null) => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await redis.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error(`Redis setWithTTL error for key ${key}:`, error);
    throw error;
  }
};

// Get value and parse JSON if possible
const get = async (key) => {
  try {
    const value = await redis.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`Redis get error for key ${key}:`, error);
    throw error;
  }
};

// Delete key(s)
const del = async (...keys) => {
  try {
    return await redis.del(...keys);
  } catch (error) {
    console.error(`Redis del error for keys ${keys}:`, error);
    throw error;
  }
};

// Check if key exists
const exists = async (key) => {
  try {
    return (await redis.exists(key)) === 1;
  } catch (error) {
    console.error(`Redis exists error for key ${key}:`, error);
    throw error;
  }
};

// Set expiration time on key
const expire = async (key, seconds) => {
  try {
    return await redis.expire(key, seconds);
  } catch (error) {
    console.error(`Redis expire error for key ${key}:`, error);
    throw error;
  }
};

// Get TTL of key
const ttl = async (key) => {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error(`Redis ttl error for key ${key}:`, error);
    throw error;
  }
};

// Hash operations
const hset = async (key, field, value) => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    return await redis.hset(key, field, serialized);
  } catch (error) {
    console.error(`Redis hset error for key ${key}, field ${field}:`, error);
    throw error;
  }
};

const hget = async (key, field) => {
  try {
    const value = await redis.hget(key, field);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`Redis hget error for key ${key}, field ${field}:`, error);
    throw error;
  }
};

const hgetall = async (key) => {
  try {
    const data = await redis.hgetall(key);
    if (!data || Object.keys(data).length === 0) return {};
    
    // Try to parse each value as JSON
    const parsed = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        parsed[field] = JSON.parse(value);
      } catch {
        parsed[field] = value;
      }
    }
    return parsed;
  } catch (error) {
    console.error(`Redis hgetall error for key ${key}:`, error);
    throw error;
  }
};

const hdel = async (key, ...fields) => {
  try {
    return await redis.hdel(key, ...fields);
  } catch (error) {
    console.error(`Redis hdel error for key ${key}, fields ${fields}:`, error);
    throw error;
  }
};

const hexists = async (key, field) => {
  try {
    return (await redis.hexists(key, field)) === 1;
  } catch (error) {
    console.error(`Redis hexists error for key ${key}, field ${field}:`, error);
    throw error;
  }
};

// Get all hash fields
const hkeys = async (key) => {
  try {
    return await redis.hkeys(key);
  } catch (error) {
    console.error(`Redis hkeys error for key ${key}:`, error);
    throw error;
  }
};

// Increment value
const incr = async (key) => {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error(`Redis incr error for key ${key}:`, error);
    throw error;
  }
};

const decr = async (key) => {
  try {
    return await redis.decr(key);
  } catch (error) {
    console.error(`Redis decr error for key ${key}:`, error);
    throw error;
  }
};

// Pattern matching
const keys = async (pattern) => {
  try {
    return await redis.keys(pattern);
  } catch (error) {
    console.error(`Redis keys error for pattern ${pattern}:`, error);
    throw error;
  }
};

// Flush all data (use with caution!)
const flushall = async () => {
  try {
    console.warn('⚠️  FLUSHING ALL REDIS DATA');
    return await redis.flushall();
  } catch (error) {
    console.error('Redis flushall error:', error);
    throw error;
  }
};

// Health check
const ping = async () => {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis ping error:', error);
    return false;
  }
};

// Graceful shutdown
const quit = async () => {
  try {
    console.log('🔌 Disconnecting from Redis...');
    await redis.quit();
    console.log('✅ Redis disconnected gracefully');
  } catch (error) {
    console.error('Redis quit error:', error);
    throw error;
  }
};

module.exports = {
  redis,
  // Simple operations
  set: setWithTTL, // Always serialize objects properly
  setWithTTL, // Для обратной совместимости
  // Tagged cache helpers
  async setWithTags(key, value, ttlSeconds = null, tags = []) {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await redis.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await redis.set(key, serialized);
    }
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) {
        await redis.sadd(`cache:tag:${tag}`, key);
      }
    }
    return true;
  },
  async invalidateTag(tag) {
    try {
      const setKey = `cache:tag:${tag}`;
      const keys = await redis.smembers(setKey);
      if (keys && keys.length > 0) {
        await redis.del(...keys);
      }
      await redis.del(setKey);
      return keys?.length || 0;
    } catch (error) {
      console.error(`Redis invalidateTag error for tag ${tag}:`, error);
      throw error;
    }
  },
  async invalidateTags(tags = []) {
    let total = 0;
    for (const tag of tags) {
      total += await this.invalidateTag(tag);
    }
    return total;
  },
  get,
  del,
  exists,
  expire,
  ttl,
  // Hash operations
  hset,
  hget,
  hgetall,
  hdel,
  hexists,
  hkeys,
  // Increment/Decrement
  incr,
  decr,
  // Pattern matching
  keys,
  // Utility
  ping,
  flushall,
  quit
};

