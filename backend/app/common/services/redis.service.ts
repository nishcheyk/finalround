
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redisClient;   // <-- Make sure to export


