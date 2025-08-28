import Bull from "bull";

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
};

const notificationQueue = new Bull("notifications", {
  redis: redisConfig,
});

export default notificationQueue;
