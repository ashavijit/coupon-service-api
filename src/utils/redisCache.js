const { redisClient } = require('../config/db');

const cache = {
  get: async (key) => {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },
  set: async (key, value, ttl = 3600) => {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  },
  del: async (key) => {
    await redisClient.del(key);
  },
};

module.exports = cache;