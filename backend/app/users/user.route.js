"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const rateLimiters_1 = require("../common/middlewares/rateLimiters");
const auth_middleware_1 = require("../common/middlewares/auth.middleware");
const otpVerification_middleware_1 = require("../common/middlewares/otpVerification.middleware");
const validation_middleware_1 = require("../common/middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post(
  "/register",
  rateLimiters_1.registerLimiter,
  (0, validation_middleware_1.validate)(
    validation_middleware_1.registerValidation,
  ),
  users_controller_1.registerController,
);
router.post(
  "/login",
  rateLimiters_1.loginLimiter,
  (0, validation_middleware_1.validate)(
    validation_middleware_1.loginValidation,
  ),
  users_controller_1.loginController,
);
router.post(
  "/refresh-token",
  rateLimiters_1.refreshLimiter,
  (0, validation_middleware_1.validate)(
    validation_middleware_1.refreshTokenValidation,
  ),
  users_controller_1.refreshTokenController,
);
router.post(
  "/logout",
  (0, auth_middleware_1.authenticator)(),
  rateLimiters_1.logoutLimiter,
  (0, validation_middleware_1.validate)(
    validation_middleware_1.logoutValidation,
  ),
  users_controller_1.logoutController,
);
router.post(
  "/reset-password",
  rateLimiters_1.resetPasswordLimiter,
  otpVerification_middleware_1.otpVerificationRequired,
  (0, validation_middleware_1.validate)(
    validation_middleware_1.resetPasswordValidation,
  ),
  users_controller_1.resetPasswordController,
);
router.get(
  "/",
  (0, auth_middleware_1.authenticator)(true),
  users_controller_1.getAllUsersController,
);
exports.default = router;
