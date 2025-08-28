// Job processors moved to queueProcessors.ts to avoid circular dependency
import notificationQueue from "./bull-queue.service";


export { notificationQueue };
