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
exports.createNotificationValidation =
  exports.logoutValidation =
  exports.refreshTokenValidation =
  exports.verifyOtpValidation =
  exports.otpValidation =
  exports.resetPasswordValidation =
  exports.loginValidation =
  exports.registerValidation =
  exports.validate =
    void 0;
const express_validator_1 = require("express-validator");
const http_errors_1 = __importDefault(require("http-errors"));
// Generic validation handler
const validate = (validations) => {
  return (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
      // Run all validations
      yield Promise.all(validations.map((validation) => validation.run(req)));
      const errors = (0, express_validator_1.validationResult)(req);
      if (errors.isEmpty()) {
        return next();
      }
      const extractedErrors = errors.array().map((err) => ({
        field: err.type === "field" ? err.path : "unknown",
        message: err.msg,
        value: err.type === "field" ? err.value : undefined,
      }));
      return next(
        (0, http_errors_1.default)(400, "Validation failed", {
          errors: extractedErrors,
        }),
      );
    });
};
exports.validate = validate;
// Validation rules for user registration
exports.registerValidation = [
  (0, express_validator_1.body)("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),
  (0, express_validator_1.body)("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  (0, express_validator_1.body)("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  (0, express_validator_1.body)("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
];
// Validation rules for user login
exports.loginValidation = [
  (0, express_validator_1.body)("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  (0, express_validator_1.body)("password")
    .notEmpty()
    .withMessage("Password is required"),
];
// Validation rules for password reset
exports.resetPasswordValidation = [
  (0, express_validator_1.body)("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  (0, express_validator_1.body)("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
];
// Validation rules for OTP
exports.otpValidation = [
  (0, express_validator_1.body)("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
];
exports.verifyOtpValidation = [
  (0, express_validator_1.body)("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  (0, express_validator_1.body)("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("OTP must be exactly 6 digits"),
];
// Validation rules for refresh token (optional since we use cookies)
exports.refreshTokenValidation = [
  (0, express_validator_1.body)("refreshToken")
    .optional()
    .notEmpty()
    .withMessage("Refresh token is required if provided"),
];
// Validation rules for logout (optional since we use cookies)
exports.logoutValidation = [
  (0, express_validator_1.body)("refreshToken")
    .optional()
    .notEmpty()
    .withMessage("Refresh token is required if provided"),
];
exports.createNotificationValidation = [
  (0, express_validator_1.body)("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  (0, express_validator_1.body)("message")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Message must be between 1 and 500 characters"),
  (0, express_validator_1.body)("type")
    .optional()
    .isIn(["info", "warning", "error", "success"])
    .withMessage("Type must be one of: info, warning, error, success"),
  (0, express_validator_1.body)("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),
  (0, express_validator_1.body)("recipients")
    .optional()
    .isArray()
    .withMessage("Recipients must be an array"),
  (0, express_validator_1.body)("isGlobal")
    .optional()
    .isBoolean()
    .withMessage("isGlobal must be a boolean"),
  (0, express_validator_1.body)("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("ExpiresAt must be a valid date"),
];
