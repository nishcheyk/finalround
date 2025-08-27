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
exports.verifyOTPController = exports.sendOTPController = void 0;
const express_async_handler_1 = __importDefault(
  require("express-async-handler"),
);
const otp_service_1 = require("./otp.service");
const email_service_1 = require("../common/services/email.service");
/**
 * Send OTP Controller
 * Generates and sends OTP to user email for password reset
 */
exports.sendOTPController = (0, express_async_handler_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
      const otp = yield (0, otp_service_1.generateAndSendOTP)(email);
      yield (0, email_service_1.sendEmail)({
        to: email,
        subject: "Your OTP for Password Reset",
        html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
      });
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      res.status(429).json({ success: false, message: error.message });
    }
  }),
);
/**
 * Verify OTP Controller
 * Validates OTP code for password reset process
 */
exports.verifyOTPController = (0, express_async_handler_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    const { valid, reason } = yield (0, otp_service_1.verifyOTP)(email, otp);
    if (!valid) {
      res.status(400).json({ success: false, message: reason });
      return;
    }
    res.json({ success: true, message: "OTP verified successfully" });
  }),
);
