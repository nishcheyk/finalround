"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const authenticator =
  (requireAdmin = false) =>
  (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw (0, http_errors_1.default)(401, "Authorization token missing");
      }
      const token = authHeader.split(" ")[1];
      if (!token) {
        throw (0, http_errors_1.default)(401, "Authorization token missing");
      }
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw (0, http_errors_1.default)(500, "JWT_SECRET is not configured");
      }
      const decoded = jsonwebtoken_1.default.verify(token, secret);
      const user = {
        userId: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
      };
      req.user = user;
      if (requireAdmin && !user.isAdmin) {
        throw (0, http_errors_1.default)(403, "Access denied: Admins only");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
exports.authenticator = authenticator;
