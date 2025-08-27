import OTPModel from "./otp.schema";
import crypto from "crypto";

const OTP_EXPIRATION_MINUTES = 5;
const RESEND_WAIT_SECONDS = 60; // Wait time between OTP sends
const MAX_ATTEMPTS = 5;

function generateOtp(): string {
  let otp: string;
  do {
    otp = crypto.randomInt(0, 999999).toString().padStart(6, "0");
    /* This code snippet is defining a Mongoose schema for an OTP (One-Time Password) document in a MongoDB
database. Let's break down what each part of the schema is doing: */
  } while (otp.startsWith("0"));
  return otp;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Generate OTP and save with expiration and sending limits.
 * Throws on resending too soon.
 */
export async function generateAndSendOTP(email: string): Promise<string> {
  const existing = await OTPModel.findOne({ email });

  if (existing) {
    const secondsSinceLast =
      (Date.now() - existing.lastSentAt.getTime()) / 1000;
    if (secondsSinceLast < RESEND_WAIT_SECONDS) {
      throw new Error(
        `Wait ${Math.ceil(RESEND_WAIT_SECONDS - secondsSinceLast)} seconds before resending OTP`,
      );
    }
  }

  const otp = generateOtp();
  const expiresAt = addMinutes(new Date(), OTP_EXPIRATION_MINUTES);

  await OTPModel.findOneAndUpdate(
    { email },
    {
      otp,
      createdAt: new Date(),
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
    { upsert: true, new: true },
  );

  return otp;
}

/**
 * Verify OTP, increment attempts on failure, clear on success.
 */
export async function verifyOTP(
  email: string,
  otp: string,
): Promise<{ valid: boolean; reason?: string }> {
  const otpRecord = await OTPModel.findOne({ email });

  if (!otpRecord) {
    return { valid: false, reason: "OTP not found or expired" };
  }

  if (otpRecord.expiresAt.getTime() < Date.now()) {
    await OTPModel.deleteOne({ email });
    return { valid: false, reason: "OTP expired" };
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    return { valid: false, reason: "Max OTP attempts exceeded" };
  }

  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    return { valid: false, reason: "Invalid OTP" };
  }

  await OTPModel.deleteOne({ email });
  return { valid: true };
}
