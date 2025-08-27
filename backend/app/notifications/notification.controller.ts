import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { NotificationService } from "./notification.service";

export const createNotificationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, message, type, priority, recipients, isGlobal, expiresAt } =
      req.body;
    const sender = req.user?.userId;
    if (!sender) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    console.log(
      "Creating notification; recipients:",
      recipients,
      "isGlobal:",
      isGlobal,
    );

    const result = await NotificationService.createNotification({
      title,
      message,
      type,
      priority,
      sender,
      recipients,
      isGlobal,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    res.status(201).json(result);
  },
);

export const getUserNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId)
      res.status(401).json({ success: false, message: "Unauthorized" });

    const result = await NotificationService.getUserNotifications(userId!);
    res.json(result);
  },
);

export const markAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const userId = req.user?.userId;
    if (!userId)
      res.status(401).json({ success: false, message: "Unauthorized" });

    const result = await NotificationService.markAsRead(
      notificationId,
      userId!,
    );
    res.json(result);
  },
);

export const markAllAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId)
      res.status(401).json({ success: false, message: "Unauthorized" });

    const result = await NotificationService.markAllAsRead(userId!);
    res.json(result);
  },
);

export const getUnreadCountController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId)
      res.status(401).json({ success: false, message: "Unauthorized" });

    const unreadCount = await NotificationService.getUnreadCount(userId!);
    res.json({ success: true, unreadCount });
  },
);

export const getAllNotificationsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await NotificationService.getAllNotifications();
    res.json(result);
  },
);

export const deleteNotificationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const result = await NotificationService.deleteNotification(notificationId);
    res.json(result);
  },
);

export const getNotificationStatsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await NotificationService.getNotificationStats();
    res.json(result);
  },
);

export const getNotificationReadStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const status =
      await NotificationService.getNotificationReadStatus(notificationId);
    res.json(status);
  },
);
