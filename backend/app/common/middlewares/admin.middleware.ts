import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

interface JwtPayload {
  userId: string;
  email?: string;
  isAdmin?: boolean;
}

/**
 * Middleware to allow only admin users.
 * Assumes authenticator middleware ran earlier and set req.user.
 */
export const adminOnly = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(createHttpError(401, "Unauthorized"));
  }
  if (!req.user.isAdmin) {
    return next(createHttpError(403, "Access denied: Admins only"));
  }
  next();
};
