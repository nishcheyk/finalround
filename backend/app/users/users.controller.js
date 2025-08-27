"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersController =
  exports.resetPasswordController =
  exports.logoutController =
  exports.refreshTokenController =
  exports.loginController =
  exports.registerController =
    void 0;
const express_async_handler_1 = __importDefault(
  require("express-async-handler"),
);
const user_service_1 = require("./user.service");
const user_schema_1 = __importDefault(require("./user.schema"));
/**
 * User Registration Controller
 * Handles user registration with validation
 */
exports.registerController = (0, express_async_handler_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, password } = req.body;
    const user = yield (0, user_service_1.registerUserService)({
      name,
      email,
      phone,
      password,
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  }),
);
/**
 * User Login Controller
 * Handles user authentication and sets refresh token cookie
 */
exports.loginController = (0, express_async_handler_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const { token, refreshToken, user } = yield (0,
    user_service_1.loginUserService)({
      email,
      password,
    });
    // Set refresh token as httpOnly cookie for security
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  }),
);
/**
 * Refresh Token Controller
 * Handles access token refresh with token rotation
 */
exports.refreshTokenController = (0, express_async_handler_1.default)(
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        res.status(401);
        throw new Error("Refresh token missing");
      }
      const { newToken, newRefreshToken } = yield (0,
      user_service_1.refreshAccessTokenService)(refreshToken);
      // Set new refresh token as httpOnly cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.json({
        success: true,
        token: newToken,
      });
    }),
);
/**
 * Logout Controller
 * Handles user logout and clears refresh token
 */
exports.logoutController = (0, express_async_handler_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      res.status(400);
      throw new Error("Refresh token missing");
    }
    const success = yield (0, user_service_1.logoutUserService)(refreshToken);
    if (success) {
      // Clear the refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.json({ success: true, message: "Logged out successfully" });
    } else {
      res.status(400);
      throw new Error("Invalid refresh token");
    }
  }),
);
/**
 * Reset Password Controller
 * Handles password reset after OTP verification
 */
exports.resetPasswordController = (0, express_async_handler_1.default)(
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const { email, password } = req.body;
      const result = yield (0, user_service_1.resetPasswordService)({
        email,
        password,
      });
      res.json(result);
    }),
);
exports.getAllUsersController = (0, express_async_handler_1.default)(
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const users = yield user_schema_1.default
          .find({}, "_id name email")
          .lean();
        res.status(200).json({ users });
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
      }
    }),
);
