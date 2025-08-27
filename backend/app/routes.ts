import { Router } from "express";
import userRouter from "./users/user.route";
import otpRouter from "./otp/otp.route";
import notificationRouter from "./notifications/notification.route";

const router = Router();

router.use("/users", userRouter);
router.use("/otp", otpRouter);
router.use("/notifications", notificationRouter);

export default router;
