import { Router } from "express";
import {
  checkAvailability,
  createAppointment,
  getUserAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAllAppointments,
} from "./appointment.controller";
import { authenticator } from "../common/middlewares/auth.middleware";
import {
  validate,
  checkAvailabilityValidation,
  createAppointmentValidation,
  cancelAppointmentValidation,
  rescheduleAppointmentValidation,
} from "../common/middlewares/validation.middleware";

const router = Router();

router.post(
  "/availability",
  validate(checkAvailabilityValidation),
  (req, res, next) => {
    console.log("POST /availability called");
    next();
  },
  checkAvailability
);

router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

router.use(authenticator()); // Subsequent routes require authentication

router.post(
  "/",
  validate(createAppointmentValidation),
  (req, res, next) => {
    console.log("POST /appointments create called");
    next();
  },
  createAppointment
);

router.get(
  "/me",
  (req, res, next) => {
    console.log("GET /appointments/me called");
    next();
  },
  getUserAppointments
);

router.get(
  "/all",
  (req, res, next) => {
    console.log("GET /appointments/all called");
    next();
  },
  getAllAppointments
);

router.post(
  "/:appointmentId/cancel",
  (req, res, next) => {
    console.log(`POST /appointments/${req.params.appointmentId}/cancel called`);
    next();
  },
  cancelAppointment
);

router.post(
  "/:appointmentId/reschedule",

  (req, res, next) => {
    console.log(
      `POST /appointments/${req.params.appointmentId}/reschedule called`
    );
    next();
  },
  rescheduleAppointment
);

export default router;
