import { AuthenticatedUser } from "./express"; // adjust path if needed

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
