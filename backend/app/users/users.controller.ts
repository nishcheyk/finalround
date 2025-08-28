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
export const updateUserRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !["user", "admin", "staff"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }
    // Prevent demoting the last admin
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount === 1) {
        res.status(400).json({ message: "Cannot demote the last admin" });
        return;
      }
    }
    user.role = role;
    await user.save();
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }
);

// Delete user
export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount === 1) {
        res.status(400).json({ message: "Cannot delete the last admin" });
        return;
      }
    }
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: "User deleted" });
  }
);

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
  }
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
  }
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
  }
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
  }
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
      const { role } = req.query;
      const filter: any = {};
      if (role && ["user", "admin", "staff"].includes(role as string)) {
        filter.role = role;
      }
      const users = await User.find(filter, "_id name email role phone").lean();
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }
);
