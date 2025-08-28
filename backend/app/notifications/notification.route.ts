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
/* The line `router.get("/user", authenticator(), getUserNotificationsController);` is setting up a GET
endpoint for retrieving notifications specific to a user. When a GET request is made to this
endpoint, the `getUserNotificationsController` function will be called to handle the retrieval of
notifications for the user. The `authenticator()` middleware is used to ensure that the user making
the request is authenticated before allowing the retrieval operation to proceed. */

router.get("/user", authenticator(), getUserNotificationsController);
/* The line `router.get("/unread-count", authenticator(), getUnreadCountController);` is setting up a
GET endpoint for retrieving the count of unread notifications for a specific user. When a GET
request is made to this endpoint, the `getUnreadCountController` function will be called to handle
the retrieval of the unread notification count. The `authenticator()` middleware is used to ensure
that the user making the request is authenticated before allowing the retrieval operation to
proceed. */
router.get("/unread-count", authenticator(), getUnreadCountController);
/* The line `router.patch("/:notificationId/read", authenticator(), markAsReadController);` is setting
up a PATCH endpoint for marking a specific notification as read. */
router.patch("/:notificationId/read", authenticator(), markAsReadController);
/* The line `router.patch("/mark-all-read", authenticator(), markAllAsReadController);` is setting up a
PATCH endpoint for marking all notifications as read. When a PATCH request is made to this endpoint,
the `markAllAsReadController` function will be called to handle the operation of marking all
notifications as read. The `authenticator()` middleware is used to ensure that the user making the
request is authenticated before allowing the marking operation to proceed. */
router.patch("/mark-all-read", authenticator(), markAllAsReadController);

/* The code snippet `router.post("/", authenticator(true), validate(createNotificationValidation),
createNotificationController);` is setting up a POST endpoint for creating a new notification. */
router.post(
  "/",
  authenticator(true),
  validate(createNotificationValidation),
  createNotificationController,
);
/* The line `router.get("/all", authenticator(true), getAllNotificationsController);` is setting up a
GET endpoint for retrieving all notifications. When a GET request is made to this endpoint, the
`getAllNotificationsController` function will be called to handle the retrieval of all
notifications. The `authenticator(true)` middleware is used to ensure that the user making the
request is authenticated before allowing the retrieval operation to proceed. */
router.get("/all", authenticator(true), getAllNotificationsController);
/* This route is setting up a DELETE endpoint for deleting a specific notification identified by
`notificationId`. When a DELETE request is made to this endpoint, the `deleteNotificationController`
function will be called to handle the deletion of the notification associated with the provided
`notificationId`. The `authenticator(true)` middleware is used to ensure that the user making the
request is authenticated before allowing the deletion operation to proceed. */
router.delete(
  "/:notificationId",
  authenticator(true),
  deleteNotificationController,
);
router.get("/stats", authenticator(true), getNotificationStatsController);
/* This route `router.get("/:notificationId/read-status", authenticator(true),
getNotificationReadStatusController);` is setting up a GET endpoint for retrieving the read status
of a specific notification identified by `notificationId`. */
router.get(
  "/:notificationId/read-status",
  authenticator(true),
  getNotificationReadStatusController,
);

export default router;
