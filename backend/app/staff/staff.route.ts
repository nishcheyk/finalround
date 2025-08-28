import { Router } from "express";
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "./staff.controller";
import { authenticator } from "../common/middlewares/auth.middleware";
import {
  validate,
  staffValidation,
} from "../common/middlewares/validation.middleware";

const router = Router();

// Admin-only routes
router.use(authenticator(true));

router.route("/").post(validate(staffValidation), createStaff).get(getStaff);

router
  .route("/:id")
  .get(getStaffById)
  .patch(validate(staffValidation), updateStaff)
  .delete(deleteStaff);

export default router;
