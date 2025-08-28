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

/* This code snippet is defining a POST route for registering a new user in an Express router. Here's a
breakdown of what each middleware function is doing in this route: */
router.post(
  "/register",
  registerLimiter,
  validate(registerValidation),
  registerController
);
/* The code `router.post("/login", loginLimiter, validate(loginValidation), loginController);` is
defining a POST route in an Express router for handling user login functionality. Here's a breakdown
of what each middleware function is doing in this route: */
router.post("/login", loginLimiter, validate(loginValidation), loginController);
/* The code snippet `router.post("/refresh-token", loginLimiter, validate(refreshTokenValidation),
refreshTokenController);` is defining a POST route in an Express router for refreshing a user's
authentication token. Here's a breakdown of what each middleware function is doing in this route: */
router.post(
  "/refresh-token",
  loginLimiter,
  validate(refreshTokenValidation),
  refreshTokenController
);
/* The code snippet `router.post("/logout", authenticator(), logoutLimiter, validate(logoutValidation),
logoutController);` is defining a POST route in an Express router for handling user logout
functionality. Here's a breakdown of what each middleware function is doing in this route: */
router.post(
  "/logout",
  authenticator(),
  logoutLimiter,
  validate(logoutValidation),
  logoutController
);

/* This code snippet is defining a POST route in an Express router for handling the reset password
functionality. Here's a breakdown of what each middleware function is doing in this route: */
router.post(
  "/reset-password",
  resetPasswordLimiter,
  otpVerificationRequired,
  validate(resetPasswordValidation),
  resetPasswordController
);

/* These lines of code are defining additional routes in an Express router for handling user-related
functionalities: */
/* The code `router.get("/", authenticator(true), getAllUsersController);` is defining a GET route in
an Express router that requires authentication with elevated privileges (admin access) to access the
`getAllUsersController` function. This route is typically used to retrieve a list of all users in
the system and is restricted to authenticated users with admin privileges. The `authenticator(true)`
middleware function ensures that only authenticated users with the specified elevated privileges can
access this route. */
router.get("/", authenticator(true), getAllUsersController);
/* The code `router.patch("/:id/role", authenticator(true), updateUserRoleController);` is defining a
PATCH route in an Express router for updating the role of a specific user identified by their `id`.
Here's a breakdown of what each middleware function is doing in this route: */
router.patch("/:id/role", authenticator(true), updateUserRoleController);
/* The code `router.delete("/:id", authenticator(true), deleteUserController);` is defining a DELETE
route in an Express router for handling the deletion of a user based on their `id`. Here's a
breakdown of what each middleware function is doing in this route: */
router.delete("/:id", authenticator(true), deleteUserController);
export default router;
