import { Request } from "express";

export interface AuthenticatedUser {
  userId: string;
  email?: string;
  isAdmin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
