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
exports.getNotificationReadStatusController =
  exports.getNotificationStatsController =
  exports.deleteNotificationController =
  exports.getAllNotificationsController =
  exports.getUnreadCountController =
  exports.markAllAsReadController =
  exports.markAsReadController =
  exports.getUserNotificationsController =
  exports.createNotificationController =
    void 0;
const express_async_handler_1 = __importDefault(
  require("express-async-handler"),
);
const notification_service_1 = require("./notification.service");
exports.createNotificationController = (0, express_async_handler_1.default)(
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _a;
      const {
        title,
        message,
        type,
        priority,
        recipients,
        isGlobal,
        expiresAt,
      } = req.body;
      const sender =
        (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
      const result =
        yield notification_service_1.NotificationService.createNotification({
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
    }),
);
exports.getUserNotificationsController = (0, express_async_handler_1.default)(
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _a;
      const userId =
        (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
      if (!userId)
        res.status(401).json({ success: false, message: "Unauthorized" });
      const result =
        yield notification_service_1.NotificationService.getUserNotifications(
          userId,
        );
      res.json(result);
    }),
);
exports.markAsReadController = (0, express_async_handler_1.default)(
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _a;
      const { notificationId } = req.params;
      const userId =
        (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
      if (!userId)
        res.status(401).json({ success: false, message: "Unauthorized" });
      const result =
        yield notification_service_1.NotificationService.markAsRead(
          notificationId,
          userId,
        );
      res.json(result);
    }),
);
exports.markAllAsReadController = (0, express_async_handler_1.default)(
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _a;
      const userId =
        (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
      if (!userId)
        res.status(401).json({ success: false, message: "Unauthorized" });
      const result =
        yield notification_service_1.NotificationService.markAllAsRead(userId);
      res.json(result);
    }),
);
exports.getUnreadCountController = (0, express_async_handler_1.default)(
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _a;
      const userId =
        (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
      if (!userId)
        res.status(401).json({ success: false, message: "Unauthorized" });
      const unreadCount =
        yield notification_service_1.NotificationService.getUnreadCount(userId);
      res.json({ success: true, unreadCount });
    }),
);
exports.getAllNotificationsController = (0, express_async_handler_1.default)(
  (_req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const result =
        yield notification_service_1.NotificationService.getAllNotifications();
      res.json(result);
    }),
);
exports.deleteNotificationController = (0, express_async_handler_1.default)(
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const { notificationId } = req.params;
      const result =
        yield notification_service_1.NotificationService.deleteNotification(
          notificationId,
        );
      res.json(result);
    }),
);
exports.getNotificationStatsController = (0, express_async_handler_1.default)(
  (_req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const result =
        yield notification_service_1.NotificationService.getNotificationStats();
      res.json(result);
    }),
);
exports.getNotificationReadStatusController = (0,
express_async_handler_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { notificationId } = req.params;
    const status =
      yield notification_service_1.NotificationService.getNotificationReadStatus(
        notificationId,
      );
    res.json(status);
  }),
);
