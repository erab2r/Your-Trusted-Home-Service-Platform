import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { serviceSchemas } from "../../utils/zodSchemas";
import { serviceController } from "./service.controller";

const router = Router();

// Technician Routes
router.get(
  "/my-services",
  auth(Role.TECHNICIAN),
  serviceController.getMyServices
);

router.post(
  "/",
  auth(Role.TECHNICIAN),
  validateRequest(serviceSchemas.create),
  serviceController.createService
);

router.patch(
  "/:id",
  auth(Role.TECHNICIAN),
  validateRequest(serviceSchemas.idParam, "params"),
  validateRequest(serviceSchemas.update),
  serviceController.updateService
);

router.delete(
  "/:id",
  auth(Role.TECHNICIAN),
  serviceController.deleteService
);

router.get("/", serviceController.getAllServices);

router.get("/:id", serviceController.getServiceById);

export const serviceRoutes = router;