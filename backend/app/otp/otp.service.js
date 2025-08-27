"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndSendOTP = generateAndSendOTP;
exports.verifyOTP = verifyOTP;
const otp_schema_1 = __importDefault(require("./otp.schema"));
const crypto_1 = __importDefault(require("crypto"));
const OTP_EXPIRATION_MINUTES = 5;
const RESEND_WAIT_SECONDS = 60; // Wait time between OTP sends
const MAX_ATTEMPTS = 5;
function generateOtp() {
  let otp;
  do {
    otp = crypto_1.default.randomInt(0, 999999).toString().padStart(6, "0");
    /* This code snippet is defining a Mongoose schema for an OTP (One-Time Password) document in a MongoDB
        database. Let's break down what each part of the schema is doing: */
  } while (otp.startsWith("0"));
  return otp;
}
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
/**
 * Generate OTP and save with expiration and sending limits.
 * Throws on resending too soon.
 */
function generateAndSendOTP(email) {
  return __awaiter(this, void 0, void 0, function* () {
    const existing = yield otp_schema_1.default.findOne({ email });
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
    yield otp_schema_1.default.findOneAndUpdate(
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
  });
}
/**
 * Verify OTP, increment attempts on failure, clear on success.
 */
function verifyOTP(email, otp) {
  return __awaiter(this, void 0, void 0, function* () {
    const otpRecord = yield otp_schema_1.default.findOne({ email });
    if (!otpRecord) {
      return { valid: false, reason: "OTP not found or expired" };
    }
    if (otpRecord.expiresAt.getTime() < Date.now()) {
      yield otp_schema_1.default.deleteOne({ email });
      return { valid: false, reason: "OTP expired" };
    }
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return { valid: false, reason: "Max OTP attempts exceeded" };
    }
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      yield otpRecord.save();
      return { valid: false, reason: "Invalid OTP" };
    }
    yield otp_schema_1.default.deleteOne({ email });
    return { valid: true };
  });
}
