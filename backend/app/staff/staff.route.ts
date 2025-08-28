import { Router } from "express";
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getBusySlotsForStaff,
} from "./staff.controller";
import { authenticator } from "../common/middlewares/auth.middleware";
import {
  validate,
  staffValidation,
} from "../common/middlewares/validation.middleware";

const router = Router();

/* This code snippet is defining routes for handling staff-related operations in an Express application
using TypeScript. Let's break down what the code is doing: */
router
  .route("/")
  .post(authenticator(true), validate(staffValidation), createStaff) // POST requires auth
  .get(getStaff, authenticator());
/* This line of code is defining a GET route for retrieving busy slots for a specific staff member. */
router.get("/:staffId/busy-slots", authenticator(), getBusySlotsForStaff);
/* This part of the code snippet is defining routes for handling staff operations based on the staff ID
in an Express application using TypeScript. Here's a breakdown of what each line is doing: */
router
  .route("/:id")
  .get(authenticator(), getStaffById) // GET /:id requires auth (normal user)
  .patch(authenticator(true), validate(staffValidation), updateStaff) // PATCH /:id requires admin
  .delete(authenticator(true), deleteStaff); // DELETE /:id requires admin

export default router;
