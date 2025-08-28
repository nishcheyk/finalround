import NotificationModel, { INotification } from "./notification.schema";
import UserModel from "../users/user.schema";
import createHttpError from "http-errors";
import { Types } from "mongoose";
import notificationQueue from "../common/services/bull-queue.service";

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  priority?: "low" | "medium" | "high";
  sender: string;
  recipients?: string[];
  isGlobal?: boolean;
  expiresAt?: Date;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notification?: INotification;
  notifications?: INotification[];
  unreadCount?: number;
}

export class NotificationService {
  // Create a new notification
  static async createNotification(
    data: CreateNotificationData
  ): Promise<NotificationResponse> {
    try {
      let recipients: string[] = [];

      if (data.isGlobal) {
        console.log("Creating global notification");
        const users = await UserModel.find({}, "_id");
        recipients = users.map((user) => user._id.toString());
      } else if (data.recipients && data.recipients.length > 0) {
        recipients = data.recipients;
      } else {
        console.log("No recipients selected and notification is not global");
        throw createHttpError(
          400,
          "Recipients are required for non-global notifications"
        );
      }

      const notification = new NotificationModel({
        ...data,
        recipients,
        readBy: [], // No one has read it yet
      });

      await notification.save();

      // Fetch recipient user details for email/SMS
      const users = await UserModel.find({ _id: { $in: recipients } });
      for (const user of users) {
        // Enqueue email job
        if (user.email) {
          await notificationQueue.add("sendNotificationEmail", {
            to: user.email,
            subject: data.title,
            html: `<div style='font-family: sans-serif;'><h2>${data.title}</h2><p>${data.message}</p></div>`,
          });
        }
        // Enqueue SMS job
        if (user.phone) {
          await notificationQueue.add("sendNotificationSMS", {
            to: user.phone,
            body: `${data.title}: ${data.message}`,
          });
        }
      }

      return {
        success: true,
        message: "Notification created successfully",
        notification,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
      throw createHttpError(500, "Failed to create notification");
    }
  }

  static async getNotificationReadStatus(notificationId: string): Promise<any> {
    try {
      const notification = await NotificationModel.findById(notificationId)
        .populate("recipients", "name email")
        .populate("readBy.user", "name email");

      if (!notification) {
        throw createHttpError(404, "Notification not found");
      }

      // Users who have read the notification
      const readUsers = notification.readBy.map((entry) => ({
        user: entry.user,
        readAt: entry.readAt,
      }));

      // Build a set of read user IDs for quick lookup
      const readUserIds = new Set(
        notification.readBy.map((entry) => entry.user._id.toString())
      );

      // Users who have NOT read the notification
      const unreadUsers = notification.recipients.filter(
        (user) => !readUserIds.has(user._id.toString())
      );

      return {
        success: true,
        readUsers,
        unreadUsers,
        notification,
      };
    } catch (error) {
      throw createHttpError(500, "Failed to get notification read status");
    }
  }

  // Get notifications for a specific user
  static async getUserNotifications(
    userId: string
  ): Promise<NotificationResponse> {
    try {
      const objectIdUser = new Types.ObjectId(userId);

      const notifications = await NotificationModel.find({
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
      const unreadCount = await this.getUnreadCount(userId);

      return {
        success: true,
        message: "Notifications retrieved successfully",
        notifications,
        unreadCount,
      };
    } catch (error) {
      throw createHttpError(500, "Failed to retrieve notifications");
    }
  }

  // Mark notification as read
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationResponse> {
    try {
      const notification = await NotificationModel.findById(notificationId);

      if (!notification) {
        throw createHttpError(404, "Notification not found");
      }

      const objectIdUser = new Types.ObjectId(userId);

      // Check if user is recipient or if it's global
      const isRecipient =
        notification.recipients.some((recipientId) =>
          recipientId.equals(objectIdUser)
        ) || notification.isGlobal;
      if (!isRecipient) {
        throw createHttpError(
          403,
          "You don't have access to this notification"
        );
      }

      // Check if already read
      const alreadyRead = notification.readBy.some((read) =>
        read.user.equals(objectIdUser)
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

      await notification.save();

      return {
        success: true,
        message: "Notification marked as read",
        notification,
      };
    } catch (error) {
      if (error instanceof createHttpError) throw error;
      throw createHttpError(500, "Failed to mark notification as read");
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<NotificationResponse> {
    try {
      const objectIdUser = new Types.ObjectId(userId);

      const result = await NotificationModel.updateMany(
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
        }
      );

      return {
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`,
      };
    } catch (error) {
      throw createHttpError(500, "Failed to mark notifications as read");
    }
  }

  // Get unread count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const objectIdUser = new Types.ObjectId(userId);

      const notifications = await NotificationModel.find({
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
          read.user.equals(objectIdUser)
        );
        if (!isRead) {
          unreadCount++;
        }
      }

      return unreadCount;
    } catch (error) {
      return 0;
    }
  }

  // Get all notifications (admin only)
  static async getAllNotifications(): Promise<NotificationResponse> {
    try {
      const notifications = await NotificationModel.find()
        .populate("sender", "name email")
        .populate("recipients", "name email")
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "All notifications retrieved successfully",
        notifications,
      };
    } catch (error) {
      throw createHttpError(500, "Failed to retrieve all notifications");
    }
  }

  // Delete notification (admin only)
  static async deleteNotification(
    notificationId: string
  ): Promise<NotificationResponse> {
    try {
      const notification =
        await NotificationModel.findByIdAndDelete(notificationId);

      if (!notification) {
        throw createHttpError(404, "Notification not found");
      }

      return {
        success: true,
        message: "Notification deleted successfully",
      };
    } catch (error) {
      if (error instanceof createHttpError) throw error;
      throw createHttpError(500, "Failed to delete notification");
    }
  }

  // Get notification statistics (admin only)
  static async getNotificationStats(): Promise<any> {
    try {
      const totalNotifications = await NotificationModel.countDocuments();
      const globalNotifications = await NotificationModel.countDocuments({
        isGlobal: true,
      });
      const todayNotifications = await NotificationModel.countDocuments({
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
      throw createHttpError(500, "Failed to get notification statistics");
    }
  }
}
