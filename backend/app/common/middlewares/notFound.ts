import { Request, Response, NextFunction } from "express";

/**
 * Catch-all route handler middleware for unmatched routes.
 * Sends 404 Not Found status and message.
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
};
