import { Request, Response, NextFunction } from "express";
import OTPModel from "../../otp/otp.schema";

/**
 * The function `otpVerificationRequired` checks if OTP verification is required based on the presence
 * of an active OTP record for a given email.
 * @param {Request} req - The `req` parameter in the `otpVerificationRequired` function stands for the
 * request object. It contains information about the HTTP request made by the client, such as request
 * headers, parameters, body, and more. In this function, `req.body` is used to extract the `email`
 * from
 * @param {Response} res - The `res` parameter in the code snippet refers to the response object in
 * Express.js. It is used to send a response back to the client making the request. In this context,
 * the `res` object is used to send JSON responses with status codes and messages indicating the
 * success or failure of the
 * @param {NextFunction} next - The `next` parameter in the `otpVerificationRequired` function is a
 * callback function that is used to pass control to the next middleware function in the
 * request-response cycle. When called, it passes the control to the next middleware function. In this
 * context, `next()` is called to proceed to the
 * @returns The `otpVerificationRequired` function is returning a response based on the conditions
 * checked within the function. If the `email` is not provided in the request body, it returns a 400
 * status with a message indicating that the email is required for OTP verification. If an active OTP
 * record is found for the provided email, it returns a 403 status with a message indicating that OTP
 * verification is required.
 */
export const otpVerificationRequired = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
    return res.status(403).json({
      success: false,
      message: "OTP verification required. Please verify your OTP first.",
    });
  }

  // No active OTP means OTP was verified and deleted
  next();
};
