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
exports.otpVerificationRequired = void 0;
const otp_schema_1 = __importDefault(require("../../otp/otp.schema"));
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
const otpVerificationRequired = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for OTP verification",
      });
    }
    // Check if OTP was verified (OTP record should be deleted after successful verification)
    const activeOtp = yield otp_schema_1.default.findOne({ email });
    if (activeOtp) {
      // OTP still exists, meaning it wasn't verified
      return res.status(403).json({
        success: false,
        message: "OTP verification required. Please verify your OTP first.",
      });
    }
    // No active OTP means OTP was verified and deleted
    next();
  });
exports.otpVerificationRequired = otpVerificationRequired;
