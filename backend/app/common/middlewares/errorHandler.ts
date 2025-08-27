import { ErrorRequestHandler } from "express";
import createHttpError from "http-errors";

/**
 * Centralized error handling middleware.
 * Returns JSON with status code and error message.
 */
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle validation errors
  if (err.status === 400 && err.errors) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Validation failed",
      errors: err.errors,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      status: 401,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      status: 401,
      message: "Token expired",
    });
  }

  // Handle MongoDB errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Validation failed",
      errors: Object.values(err.errors).map((e: any) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Duplicate field value",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    status,
    message:
      process.env.NODE_ENV === "production" ? "Internal Server Error" : message,
  });
};

export default errorHandler;
