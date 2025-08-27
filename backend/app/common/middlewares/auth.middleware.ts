import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { AuthenticatedUser } from "../../types/express";

interface JwtPayload {
  userId: string;
  email?: string;
  isAdmin?: boolean;
}

export const authenticator =
  (requireAdmin = false) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw createHttpError(401, "Authorization token missing");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw createHttpError(401, "Authorization token missing");
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw createHttpError(500, "JWT_SECRET is not configured");
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;

      const user: AuthenticatedUser = {
        userId: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
      };

      req.user = user;

      if (requireAdmin && !user.isAdmin) {
        throw createHttpError(403, "Access denied: Admins only");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
