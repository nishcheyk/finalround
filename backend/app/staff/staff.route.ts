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

router
  .route("/")
  .post(authenticator(true), validate(staffValidation), createStaff) // POST requires auth
  .get(getStaff, authenticator());
router.get("/:staffId/busy-slots", authenticator(), getBusySlotsForStaff);
router
  .route("/:id")
  .get(authenticator(), getStaffById) // GET /:id requires auth (normal user)
  .patch(authenticator(true), validate(staffValidation), updateStaff) // PATCH /:id requires admin
  .delete(authenticator(true), deleteStaff); // DELETE /:id requires admin

export default router;
