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
  static async createNotification(
    data: CreateNotificationData
  ): Promise<NotificationResponse> {
    try {
      let recipients: string[] = [];

      if (data.isGlobal) {
        console.log("Creating global notification");
        const users = await UserModel.find({}, "_id");
        recipients = users.map((user) => user._id.toString());
        console.log(`Global recipients count: ${recipients.length}`);
      } else if (data.recipients && data.recipients.length > 0) {
        recipients = data.recipients;
        console.log(`Selected recipients: ${recipients.join(", ")}`);
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
        readBy: [],
      });

      await notification.save();
      console.log("Notification saved successfully with ID:", notification._id);

      const users = await UserModel.find({ _id: { $in: recipients } });
      console.log(`Fetched recipient user data count: ${users.length}`);

      for (const user of users) {
        if (user.email) {
          await notificationQueue.add("sendNotificationEmail", {
            to: user.email,
            subject: data.title,
            html: `<div style='font-family: sans-serif;'><h2>${data.title}</h2><p>${data.message}</p></div>`,
          });
          console.log(`Enqueued email job for ${user.email}`);
        }
        if (user.phone) {
          await notificationQueue.add("sendNotificationSMS", {
            to: user.phone,
            body: `${data.title}: ${data.message}`,
          });
          console.log(`Enqueued SMS job for ${user.phone}`);
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
        console.log(`Notification not found for id: ${notificationId}`);
        throw createHttpError(404, "Notification not found");
      }

      const readUsers = notification.readBy.map((entry) => ({
        user: entry.user,
        readAt: entry.readAt,
      }));

      const readUserIds = new Set(
        notification.readBy.map((entry) => entry.user._id.toString())
      );

      const unreadUsers = notification.recipients.filter(
        (user) => !readUserIds.has(user._id.toString())
      );

      console.log(
        `Read users count: ${readUsers.length}, unread users count: ${unreadUsers.length}`
      );

      return {
        success: true,
        readUsers,
        unreadUsers,
        notification,
      };
    } catch (error) {
      console.error("Error getting notification read status:", error);
      throw createHttpError(500, "Failed to get notification read status");
    }
  }

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

      const unreadCount = await this.getUnreadCount(userId);

      console.log(
        `Fetched ${notifications.length} notifications for user ${userId}, unread count: ${unreadCount}`
      );

      return {
        success: true,
        message: "Notifications retrieved successfully",
        notifications,
        unreadCount,
      };
    } catch (error) {
      console.error("Error retrieving notifications:", error);
      throw createHttpError(500, "Failed to retrieve notifications");
    }
  }

  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationResponse> {
    try {
      const notification = await NotificationModel.findById(notificationId);

      if (!notification) {
        console.log(`Notification not found for id: ${notificationId}`);
        throw createHttpError(404, "Notification not found");
      }

      const objectIdUser = new Types.ObjectId(userId);

      const isRecipient =
        notification.recipients.some((recipientId) =>
          recipientId.equals(objectIdUser)
        ) || notification.isGlobal;
      if (!isRecipient) {
        console.log(
          `User ${userId} does not have access to notification ${notificationId}`
        );
        throw createHttpError(
          403,
          "You don't have access to this notification"
        );
      }

      const alreadyRead = notification.readBy.some((read) =>
        read.user.equals(objectIdUser)
      );
      if (alreadyRead) {
        return {
          success: true,
          message: "Notification already marked as read",
        };
      }

      notification.readBy.push({
        user: objectIdUser,
        readAt: new Date(),
      });

      await notification.save();

      console.log(
        `User ${userId} marked notification ${notificationId} as read`
      );

      return {
        success: true,
        message: "Notification marked as read",
        notification,
      };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      if (error instanceof createHttpError) throw error;
      throw createHttpError(500, "Failed to mark notification as read");
    }
  }

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

      console.log(
        `Marked ${result.modifiedCount} notifications as read for user ${userId}`
      );

      return {
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`,
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw createHttpError(500, "Failed to mark notifications as read");
    }
  }

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

      console.log(`User ${userId} has ${unreadCount} unread notifications`);

      return unreadCount;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  static async getAllNotifications(): Promise<NotificationResponse> {
    try {
      const notifications = await NotificationModel.find()
        .populate("sender", "name email")
        .populate("recipients", "name email")
        .sort({ createdAt: -1 });

      console.log(`Fetched ${notifications.length} total notifications`);

      return {
        success: true,
        message: "All notifications retrieved successfully",
        notifications,
      };
    } catch (error) {
      console.error("Error getting all notifications:", error);
      throw createHttpError(500, "Failed to retrieve all notifications");
    }
  }

  static async deleteNotification(
    notificationId: string
  ): Promise<NotificationResponse> {
    try {
      const notification =
        await NotificationModel.findByIdAndDelete(notificationId);

      if (!notification) {
        console.log(`Notification not found with id: ${notificationId}`);
        throw createHttpError(404, "Notification not found");
      }

      console.log(`Deleted notification with id: ${notificationId}`);

      return {
        success: true,
        message: "Notification deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      if (error instanceof createHttpError) throw error;
      throw createHttpError(500, "Failed to delete notification");
    }
  }

  static async getNotificationStats(): Promise<any> {
    try {
      const totalNotifications = await NotificationModel.countDocuments();
      const globalNotifications = await NotificationModel.countDocuments({
        isGlobal: true,
      });
      const todayNotifications = await NotificationModel.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
      });

      console.log(
        `Stats: total=${totalNotifications}, global=${globalNotifications}, today=${todayNotifications}`
      );

      return {
        success: true,
        stats: {
          total: totalNotifications,
          global: globalNotifications,
          today: todayNotifications,
        },
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      throw createHttpError(500, "Failed to get notification statistics");
    }
  }
}
