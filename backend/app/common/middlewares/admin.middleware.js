"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
/**
 * Middleware to allow only admin users.
 * Assumes authenticator middleware ran earlier and set req.user.
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next((0, http_errors_1.default)(401, "Unauthorized"));
  }
  if (!req.user.isAdmin) {
    return next((0, http_errors_1.default)(403, "Access denied: Admins only"));
  }
  next();
};
exports.adminOnly = adminOnly;
