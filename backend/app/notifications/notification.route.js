"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const auth_middleware_1 = require("../common/middlewares/auth.middleware");
const validation_middleware_1 = require("../common/middlewares/validation.middleware");
const validation_middleware_2 = require("../common/middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.get(
  "/user",
  (0, auth_middleware_1.authenticator)(),
  notification_controller_1.getUserNotificationsController,
);
router.get(
  "/unread-count",
  (0, auth_middleware_1.authenticator)(),
  notification_controller_1.getUnreadCountController,
);
router.patch(
  "/:notificationId/read",
  (0, auth_middleware_1.authenticator)(),
  notification_controller_1.markAsReadController,
);
router.patch(
  "/mark-all-read",
  (0, auth_middleware_1.authenticator)(),
  notification_controller_1.markAllAsReadController,
);
router.post(
  "/",
  (0, auth_middleware_1.authenticator)(true),
  (0, validation_middleware_1.validate)(
    validation_middleware_2.createNotificationValidation,
  ),
  notification_controller_1.createNotificationController,
);
router.get(
  "/all",
  (0, auth_middleware_1.authenticator)(true),
  notification_controller_1.getAllNotificationsController,
);
router.delete(
  "/:notificationId",
  (0, auth_middleware_1.authenticator)(true),
  notification_controller_1.deleteNotificationController,
);
router.get(
  "/stats",
  (0, auth_middleware_1.authenticator)(true),
  notification_controller_1.getNotificationStatsController,
);
router.get(
  "/:notificationId/read-status",
  (0, auth_middleware_1.authenticator)(true),
  notification_controller_1.getNotificationReadStatusController,
);
exports.default = router;
