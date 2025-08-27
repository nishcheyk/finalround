import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
  resetPasswordService,
} from "./user.service";
import User from "./user.schema";
/**
 * User Registration Controller
 * Handles user registration with validation
 */
export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;
    const user = await registerUserService({ name, email, phone, password });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  },
);

/**
 * User Login Controller
 * Handles user authentication and sets refresh token cookie
 */
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { token, refreshToken, user } = await loginUserService({
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
  },
);

/**
 * Refresh Token Controller
 * Handles access token refresh with token rotation
 */
export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401);
      throw new Error("Refresh token missing");
    }

    const { newToken, newRefreshToken } =
      await refreshAccessTokenService(refreshToken);

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
  },
);

/**
 * Logout Controller
 * Handles user logout and clears refresh token
 */
export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(400);
      throw new Error("Refresh token missing");
    }

    const success = await logoutUserService(refreshToken);

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
  },
);

/**
 * Reset Password Controller
 * Handles password reset after OTP verification
 */
export const resetPasswordController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await resetPasswordService({ email, password });
  res.json(result);
});

export const getAllUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const users = await User.find({}, "_id name email").lean();
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  },
);
