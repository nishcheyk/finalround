import { ObjectId } from "mongoose";
declare namespace Express {
  interface AuthenticatedUser {
    userId: string | ObjectId;
    email?: string;
    isAdmin?: boolean;
  }
  interface Request {
    user?: AuthenticatedUser;
  }
}
