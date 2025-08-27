"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
/**
 * Catch-all route handler middleware for unmatched routes.
 * Sends 404 Not Found status and message.
 */
const notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};
exports.notFound = notFound;
