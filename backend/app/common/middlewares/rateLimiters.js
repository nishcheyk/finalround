"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordLimiter =
  exports.logoutLimiter =
  exports.refreshLimiter =
  exports.registerLimiter =
  exports.loginLimiter =
    void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Rate limiter middleware for login endpoint.
 * Limits each IP to 5 login requests per 15 minutes to prevent brute force attacks.
 */
exports.loginLimiter = (0, express_rate_limit_1.default)({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: 429,
    error: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
/**
 * Rate limiter middleware for registration endpoint.
 * Limits each IP to 3 account creations per hour to prevent abuse.
 */
exports.registerLimiter = (0, express_rate_limit_1.default)({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    status: 429,
    error: "Too many accounts created from this IP, please try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
/**
 * Rate limiter middleware for refresh token endpoint.
 * Limits each IP to 10 token refresh requests per 15 minutes to avoid token abuse.
 */
exports.refreshLimiter = (0, express_rate_limit_1.default)({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: 429,
    error: "Too many token refresh attempts, please try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
/**
 * Rate limiter middleware for logout endpoint.
 * Limits each IP to 10 logout requests per 15 minutes.
 */
exports.logoutLimiter = (0, express_rate_limit_1.default)({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 429,
    error: "Too many logout requests, please try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
/* The `resetPasswordLimiter` constant is defining a rate limiter middleware for the reset password
endpoint. It limits each IP address to 5 password reset attempts per 15 minutes to prevent abuse or
potential attacks. If the limit is exceeded, a status code of 429 (Too Many Requests) is returned
along with an error message "Too many password reset attempts, please try later." This middleware
includes standard headers in the response and does not include legacy headers. */
exports.resetPasswordLimiter = (0, express_rate_limit_1.default)({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // limit to 5 reset attempts per IP per windowMs
  message: {
    status: 429,
    error: "Too many password reset attempts, please try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
