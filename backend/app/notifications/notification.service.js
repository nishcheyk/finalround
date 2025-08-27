"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_schema_1 = __importDefault(require("./notification.schema"));
const user_schema_1 = __importDefault(require("../users/user.schema"));
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = require("mongoose");
class NotificationService {
  // Create a new notification
  static createNotification(data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let recipients = [];
        if (data.isGlobal) {
          console.log("Creating global notification");
          const users = yield user_schema_1.default.find({}, "_id");
          recipients = users.map((user) => user._id.toString());
        } else if (data.recipients && data.recipients.length > 0) {
          recipients = data.recipients;
        } else {
          console.log("No recipients selected and notification is not global");
          throw (0, http_errors_1.default)(
            400,
            "Recipients are required for non-global notifications",
          );
        }
        const notification = new notification_schema_1.default(
          Object.assign(Object.assign({}, data), { recipients, readBy: [] }),
        );
        yield notification.save();
        return {
          success: true,
          message: "Notification created successfully",
          notification,
        };
      } catch (error) {
        console.error("Error creating notification:", error);
        throw (0, http_errors_1.default)(500, "Failed to create notification");
      }
    });
  }
  static getNotificationReadStatus(notificationId) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const notification = yield notification_schema_1.default
          .findById(notificationId)
          .populate("recipients", "name email")
          .populate("readBy.user", "name email");
        if (!notification) {
          throw (0, http_errors_1.default)(404, "Notification not found");
        }
        // Users who have read the notification
        const readUsers = notification.readBy.map((entry) => ({
          user: entry.user,
          readAt: entry.readAt,
        }));
        // Build a set of read user IDs for quick lookup
        const readUserIds = new Set(
          notification.readBy.map((entry) => entry.user._id.toString()),
        );
        // Users who have NOT read the notification
        const unreadUsers = notification.recipients.filter(
          (user) => !readUserIds.has(user._id.toString()),
        );
        return {
          success: true,
          readUsers,
          unreadUsers,
          notification,
        };
      } catch (error) {
        throw (0, http_errors_1.default)(
          500,
          "Failed to get notification read status",
        );
      }
    });
  }
  // Get notifications for a specific user
  static getUserNotifications(userId) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const objectIdUser = new mongoose_1.Types.ObjectId(userId);
        const notifications = yield notification_schema_1.default
          .find({
            $and: [
              {
                $or: [{ recipients: objectIdUser }, { isGlobal: true }],
              },
              {
                $or: [
                  { expiresAt: { $gt: new Date() } },
                  { expiresAt: { $exists: false } },
                ],
              },
            ],
          })
          .populate("sender", "name email")
          .sort({ createdAt: -1 })
          .limit(50);
        // Calculate unread count
        const unreadCount = yield this.getUnreadCount(userId);
        return {
          success: true,
          message: "Notifications retrieved successfully",
          notifications,
          unreadCount,
        };
      } catch (error) {
        throw (0, http_errors_1.default)(
          500,
          "Failed to retrieve notifications",
        );
      }
    });
  }
  // Mark notification as read
  static markAsRead(notificationId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const notification =
          yield notification_schema_1.default.findById(notificationId);
        if (!notification) {
          throw (0, http_errors_1.default)(404, "Notification not found");
        }
        const objectIdUser = new mongoose_1.Types.ObjectId(userId);
        // Check if user is recipient or if it's global
        const isRecipient =
          notification.recipients.some((recipientId) =>
            recipientId.equals(objectIdUser),
          ) || notification.isGlobal;
        if (!isRecipient) {
          throw (0, http_errors_1.default)(
            403,
            "You don't have access to this notification",
          );
        }
        // Check if already read
        const alreadyRead = notification.readBy.some((read) =>
          read.user.equals(objectIdUser),
        );
        if (alreadyRead) {
          return {
            success: true,
            message: "Notification already marked as read",
          };
        }
        // Mark as read
        notification.readBy.push({
          user: objectIdUser,
          readAt: new Date(),
        });
        yield notification.save();
        return {
          success: true,
          message: "Notification marked as read",
          notification,
        };
      } catch (error) {
        if (error instanceof http_errors_1.default) throw error;
        throw (0, http_errors_1.default)(
          500,
          "Failed to mark notification as read",
        );
      }
    });
  }
  // Mark all notifications as read for a user
  static markAllAsRead(userId) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const objectIdUser = new mongoose_1.Types.ObjectId(userId);
        const result = yield notification_schema_1.default.updateMany(
          {
            $or: [{ recipients: objectIdUser }, { isGlobal: true }],
            "readBy.user": { $ne: objectIdUser },
          },
          {
            $push: {
              readBy: {
                user: objectIdUser,
                readAt: new Date(),
              },
            },
          },
        );
        return {
          success: true,
          message: `Marked ${result.modifiedCount} notifications as read`,
        };
      } catch (error) {
        throw (0, http_errors_1.default)(
          500,
          "Failed to mark notifications as read",
        );
      }
    });
  }
  // Get unread count for a user
  static getUnreadCount(userId) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const objectIdUser = new mongoose_1.Types.ObjectId(userId);
        const notifications = yield notification_schema_1.default.find({
          $and: [
            {
              $or: [{ recipients: objectIdUser }, { isGlobal: true }],
            },
            {
              $or: [
                { expiresAt: { $gt: new Date() } },
                { expiresAt: { $exists: false } },
              ],
            },
          ],
        });
        let unreadCount = 0;
        for (const notification of notifications) {
          const isRead = notification.readBy.some((read) =>
            read.user.equals(objectIdUser),
          );
          if (!isRead) {
            unreadCount++;
          }
        }
        return unreadCount;
      } catch (error) {
        return 0;
      }
    });
  }
  // Get all notifications (admin only)
  static getAllNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const notifications = yield notification_schema_1.default
          .find()
          .populate("sender", "name email")
          .populate("recipients", "name email")
          .sort({ createdAt: -1 });
        return {
          success: true,
          message: "All notifications retrieved successfully",
          notifications,
        };
      } catch (error) {
        throw (0, http_errors_1.default)(
          500,
          "Failed to retrieve all notifications",
        );
      }
    });
  }
  // Delete notification (admin only)
  static deleteNotification(notificationId) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const notification =
          yield notification_schema_1.default.findByIdAndDelete(notificationId);
        if (!notification) {
          throw (0, http_errors_1.default)(404, "Notification not found");
        }
        return {
          success: true,
          message: "Notification deleted successfully",
        };
      } catch (error) {
        if (error instanceof http_errors_1.default) throw error;
        throw (0, http_errors_1.default)(500, "Failed to delete notification");
      }
    });
  }
  // Get notification statistics (admin only)
  static getNotificationStats() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const totalNotifications =
          yield notification_schema_1.default.countDocuments();
        const globalNotifications =
          yield notification_schema_1.default.countDocuments({
            isGlobal: true,
          });
        const todayNotifications =
          yield notification_schema_1.default.countDocuments({
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
          });
        return {
          success: true,
          stats: {
            total: totalNotifications,
            global: globalNotifications,
            today: todayNotifications,
          },
        };
      } catch (error) {
        throw (0, http_errors_1.default)(
          500,
          "Failed to get notification statistics",
        );
      }
    });
  }
}
exports.NotificationService = NotificationService;
