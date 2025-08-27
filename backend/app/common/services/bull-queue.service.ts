import Bull from 'bull';
import redisClient from './redis.service';

const notificationQueue = new Bull('notifications', {redis: { host: '127.0.0.1', port: 6379 }});

export default notificationQueue;
