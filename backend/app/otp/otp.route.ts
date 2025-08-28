// otp.routes.ts
import express from "express";
import { sendOTPController, verifyOTPController } from "./otp.controller";
import { resetPasswordLimiter } from "../common/middlewares/rateLimiters";
import {
  validate,
  otpValidation,
  verifyOtpValidation,
} from "../common/middlewares/validation.middleware";

const router = express.Router();

/* These lines of code are setting up POST routes for sending and verifying OTP (One Time Password) in
an Express application using TypeScript. Here's a breakdown of what each part is doing: */
router.post(
  "/send-otp",

  validate(otpValidation),
  sendOTPController
);
router.post(
  "/verify-otp",

  validate(verifyOtpValidation),
  verifyOTPController
);

export default router;
