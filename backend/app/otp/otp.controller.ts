import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { generateAndSendOTP, verifyOTP } from "./otp.service";
import { sendEmail } from "../common/services/email.service";

/**
 * Send OTP Controller
 * Generates and sends OTP to user email for password reset
 */
export const sendOTPController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const otp = await generateAndSendOTP(email);
      await sendEmail({
        to: email,
        subject: "Your OTP for Password Reset",
        html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
      });
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error: any) {
      res.status(429).json({ success: false, message: error.message });
    }
  }
);

/**
 * Verify OTP Controller
 * Validates OTP code for password reset process
 */
export const verifyOTPController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const { valid, reason } = await verifyOTP(email, otp);
    if (!valid) {
      res.status(400).json({ success: false, message: reason });
      return;
    }

    res.json({ success: true, message: "OTP verified successfully" });
  }
);
