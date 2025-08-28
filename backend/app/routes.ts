import { Router } from "express";
import userRoutes from "./users/user.route";
import otpRoutes from "./otp/otp.route";
import notificationRoutes from "./notifications/notification.route";
import serviceRoutes from "./services/service.route";
import staffRoutes from "./staff/staff.route";
import appointmentRoutes from "./appointment/appointment.route";

const router = Router();

/* These lines of code are setting up routes for different modules in an Express application. Each
`router.use` statement is associating a specific route path with the corresponding route handler
defined in separate files. */
router.use("/users", userRoutes);
router.use("/otp", otpRoutes);
router.use("/notifications", notificationRoutes);
router.use("/services", serviceRoutes);
router.use("/staff", staffRoutes);
router.use("/appointments", appointmentRoutes);

export default router;
