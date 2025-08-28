import { Router } from "express";
import {
  checkAvailability,
  createAppointment,
  getUserAppointments,
} from "./appointment.controller";
import { authenticator } from "../common/middlewares/auth.middleware";
import {
  validate,
  checkAvailabilityValidation,
  createAppointmentValidation,
} from "../common/middlewares/validation.middleware";

const router = Router();

router.post(
  "/availability",
  validate(checkAvailabilityValidation),
  checkAvailability
);

router.use(authenticator()); // All subsequent routes require authentication
router.post("/", validate(createAppointmentValidation), createAppointment);
router.get("/me", getUserAppointments);

export default router;
