import { Router } from "express";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from "./service.controller";
import { authenticator } from "../common/middlewares/auth.middleware";
import {
  validate,
  serviceValidation,
} from "../common/middlewares/validation.middleware";

const router = Router();

// Middleware for logging requests to service routes
router.use((req, res, next) => {
  console.log(`[SERVICES] Request to: ${req.method} ${req.originalUrl}`);
  next();
});

// Admin-only routes
router.use(authenticator(true));

router
  .route("/")
  .post(validate(serviceValidation), createService)
  .get(getServices);

router
  .route("/:id")
  .get(getServiceById)
  .patch(validate(serviceValidation), updateService)
  .delete(deleteService);

export default router;
