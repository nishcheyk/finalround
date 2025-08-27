"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// otp.routes.ts
const express_1 = __importDefault(require("express"));
const otp_controller_1 = require("./otp.controller");
const rateLimiters_1 = require("../common/middlewares/rateLimiters");
const validation_middleware_1 = require("../common/middlewares/validation.middleware");
const router = express_1.default.Router();
/* These lines of code are setting up POST routes for sending and verifying OTP (One Time Password) in
an Express application using TypeScript. Here's a breakdown of what each part is doing: */
router.post(
  "/send-otp",
  rateLimiters_1.resetPasswordLimiter,
  (0, validation_middleware_1.validate)(validation_middleware_1.otpValidation),
  otp_controller_1.sendOTPController,
);
router.post(
  "/verify-otp",
  rateLimiters_1.resetPasswordLimiter,
  (0, validation_middleware_1.validate)(
    validation_middleware_1.verifyOtpValidation,
  ),
  otp_controller_1.verifyOTPController,
);
exports.default = router;
