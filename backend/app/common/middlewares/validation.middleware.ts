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
    if (!Array.isArray(validations)) {
      console.error("Validations is not an array:", validations);
      throw new Error("Validation rules must be an array");
    }
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
      createHttpError(400, "Validation failed", { errors: extractedErrors })
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
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("phone")
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
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
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

// Validation rules for Service
export const serviceValidation = [
  body("name").trim().notEmpty().withMessage("Service name is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Service description is required"),
  body("duration")
    .isInt({ min: 5 })
    .withMessage("Duration must be an integer of at least 5 minutes"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
];

// Validation rules for Staff
export const staffValidation = [
  body("user").isMongoId().withMessage("A valid user ID is required"),
  body("services")
    .optional()
    .isArray()
    .withMessage("Services must be an array"),
  body("services.*").isMongoId().withMessage("Each service must be a valid ID"),
  body("availability")
    .isArray({ min: 1 })
    .withMessage("Availability must be a non-empty array"),
  body("availability.*.dayOfWeek")
    .isInt({ min: 0, max: 6 })
    .withMessage("dayOfWeek must be between 0 (Sun) and 6 (Sat)"),
  body("availability.*.startTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("startTime must be in HH:mm format"),
  body("availability.*.endTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("endTime must be in HH:mm format"),
];

// Validation rules for checking availability
export const checkAvailabilityValidation = [
  body("serviceId").isMongoId().withMessage("A valid serviceId is required"),
  body("staffId").isMongoId().withMessage("A valid staffId is required"),
  body("date")
    .isISO8601()
    .toDate()
    .withMessage("A valid date in ISO8601 format is required"),
];

// Validation rules for creating an appointment
export const createAppointmentValidation = [
  body("staffId").isMongoId().withMessage("A valid staffId is required"),
  body("serviceId").isMongoId().withMessage("A valid serviceId is required"),
  body("startTime")
    .isISO8601()
    .toDate()
    .withMessage("A valid startTime in ISO8601 format is required"),
];

export const cancelAppointmentValidation = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isMongoId()
    .withMessage("Appointment ID must be a valid Mongo ID"),
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID must be a valid Mongo ID"),
];

// Validation for rescheduleAppointment request
export const rescheduleAppointmentValidation = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isMongoId()
    .withMessage("Appointment ID must be a valid Mongo ID"),
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID must be a valid Mongo ID"),
  body("newStartTime")
    .notEmpty()
    .withMessage("New start time is required")
    .isISO8601()
    .toDate()
    .withMessage("New start time must be a valid ISO8601 date"),
];
