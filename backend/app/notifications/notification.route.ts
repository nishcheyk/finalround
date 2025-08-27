import { Router } from "express";
import {
  createNotificationController,
  getUserNotificationsController,
  markAsReadController,
  markAllAsReadController,
  getUnreadCountController,
  getAllNotificationsController,
  deleteNotificationController,
  getNotificationStatsController,
  getNotificationReadStatusController,
} from "./notification.controller";

import { authenticator } from "../common/middlewares/auth.middleware";
import { validate } from "../common/middlewares/validation.middleware";
import { createNotificationValidation } from "../common/middlewares/validation.middleware";

const router = Router();

router.get("/user", authenticator(), getUserNotificationsController);
router.get("/unread-count", authenticator(), getUnreadCountController);
router.patch("/:notificationId/read", authenticator(), markAsReadController);
router.patch("/mark-all-read", authenticator(), markAllAsReadController);

router.post(
  "/",
  authenticator(true),
  validate(createNotificationValidation),
  createNotificationController,
);
router.get("/all", authenticator(true), getAllNotificationsController);
router.delete(
  "/:notificationId",
  authenticator(true),
  deleteNotificationController,
);
router.get("/stats", authenticator(true), getNotificationStatsController);
router.get(
  "/:notificationId/read-status",
  authenticator(true),
  getNotificationReadStatusController,
);

export default router;
