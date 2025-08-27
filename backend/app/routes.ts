import { Router } from "express";
import userRouter from "./users/user.route";
import otpRouter from "./otp/otp.route";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

router.use("/users", userRouter);
router.use("/otp", otpRouter);

export default router;
