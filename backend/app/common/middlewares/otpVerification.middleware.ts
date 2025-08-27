import { Request, Response, NextFunction } from "express";
import OTPModel from "../../otp/otp.schema";

export const otpVerificationRequired = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required for OTP verification",
    });
  }

  // Check if OTP was verified (OTP record should be deleted after successful verification)
  const activeOtp = await OTPModel.findOne({ email });
  
  if (activeOtp) {
    // OTP still exists, meaning it wasn't verified
    return res
      .status(403)
      .json({ 
        success: false, 
        message: "OTP verification required. Please verify your OTP first." 
      });
  }

  // No active OTP means OTP was verified and deleted
  next();
};
