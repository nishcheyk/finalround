// otp.routes.ts
import express from "express";
import { sendOTPController, verifyOTPController } from "./otp.controller";
import { resetPasswordLimiter } from "../common/middlewares/rateLimiters";
import { validate, otpValidation, verifyOtpValidation } from "../common/middlewares/validation.middleware";

const router = express.Router();

router.post("/send-otp", resetPasswordLimiter, validate(otpValidation), sendOTPController);
router.post("/verify-otp", resetPasswordLimiter, validate(verifyOtpValidation), verifyOTPController);

export default router;
