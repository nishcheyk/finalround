import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number; // count failed verification attempts
  lastSentAt: Date; // timestamp of last OTP sent
}

const otpSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index deletes doc on expiry
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model<IOTP>("OTP", otpSchema);
