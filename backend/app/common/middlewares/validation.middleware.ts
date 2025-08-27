import { Request, Response, NextFunction } from "express";
import {
  body,
  validationResult,
  ValidationChain,
  ValidationError,
} from "express-validator";
import createHttpError from "http-errors";

// Generic validation handler
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err: ValidationError) => ({
      field: err.type === "field" ? err.path : "unknown",
      message: err.msg,
      value: err.type === "field" ? err.value : undefined,
    }));

    return next(
      createHttpError(400, "Validation failed", { errors: extractedErrors }),
    );
  };
};

// Validation rules for user registration
export const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),

  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
];

// Validation rules for user login
export const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),
];

// Validation rules for password reset
export const resetPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
];

// Validation rules for OTP
export const otpValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
];

export const verifyOtpValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("OTP must be exactly 6 digits"),
];

// Validation rules for refresh token (optional since we use cookies)
export const refreshTokenValidation = [
  body("refreshToken")
    .optional()
    .notEmpty()
    .withMessage("Refresh token is required if provided"),
];

// Validation rules for logout (optional since we use cookies)
export const logoutValidation = [
  body("refreshToken")
    .optional()
    .notEmpty()
    .withMessage("Refresh token is required if provided"),
];

export const createNotificationValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  body("message")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Message must be between 1 and 500 characters"),
  body("type")
    .optional()
    .isIn(["info", "warning", "error", "success"])
    .withMessage("Type must be one of: info, warning, error, success"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),
  body("recipients")
    .optional()
    .isArray()
    .withMessage("Recipients must be an array"),
  body("isGlobal")
    .optional()
    .isBoolean()
    .withMessage("isGlobal must be a boolean"),
  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("ExpiresAt must be a valid date"),
];
