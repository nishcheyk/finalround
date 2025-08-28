import { Router } from "express";
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  resetPasswordController,
  getAllUsersController,
  updateUserRoleController,
  deleteUserController,
} from "./users.controller";

import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  logoutLimiter,
  resetPasswordLimiter,
} from "../common/middlewares/rateLimiters";

import { authenticator } from "../common/middlewares/auth.middleware";
import { otpVerificationRequired } from "../common/middlewares/otpVerification.middleware";
import {
  validate,
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  refreshTokenValidation,
  logoutValidation,
} from "../common/middlewares/validation.middleware";

const router = Router();
// Debug: log every request to this router

router.post(
  "/register",
  registerLimiter,
  validate(registerValidation),
  registerController
);
router.post("/login", loginLimiter, validate(loginValidation), loginController);
router.post(
  "/refresh-token",
  refreshLimiter,
  validate(refreshTokenValidation),
  refreshTokenController
);
router.post(
  "/logout",
  authenticator(),
  logoutLimiter,
  validate(logoutValidation),
  logoutController
);

router.post(
  "/reset-password",
  resetPasswordLimiter,
  otpVerificationRequired,
  validate(resetPasswordValidation),
  resetPasswordController
);

router.get("/", authenticator(true), getAllUsersController);
router.patch("/:id/role", authenticator(true), updateUserRoleController);
router.delete("/:id", authenticator(true), deleteUserController);
export default router;
