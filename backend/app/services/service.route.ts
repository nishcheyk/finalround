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
/* This section of code is defining routes for handling requests related to creating a new service.
Here's a breakdown of what each line is doing: */

router
  .route("/")
  .get(getServices) // Public access
  .post(authenticator(true), validate(serviceValidation), createService); // Authenticated POST

/* This section of code is defining routes for handling requests related to a specific service
identified by its ID. Here's a breakdown of what each line is doing: */
router
  .route("/:id")
  .get(getServiceById) // Public access or apply authenticator() if read auth required
  .patch(authenticator(true), validate(serviceValidation), updateService)
  .delete(authenticator(true), deleteService);

export default router;
