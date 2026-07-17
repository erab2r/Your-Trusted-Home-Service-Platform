import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { availabilitySchemas } from "../../utils/zodSchemas";
import { availabilityController } from "./availability.controller";

const router = Router();

router.post(
  "/",
  auth(Role.TECHNICIAN),
  validateRequest(availabilitySchemas.create),
  availabilityController.createAvailability
);

router.get(
  "/my-work-slots",
  auth(Role.TECHNICIAN),
  availabilityController.getMyAvailability
);

router.get(
  "/:technicianId",
  validateRequest(availabilitySchemas.technicianParam, "params"),
  availabilityController.getTechnicianAvailability
);

router.patch(
  "/:id",
  auth(Role.TECHNICIAN),
  validateRequest(availabilitySchemas.idParam, "params"),
  validateRequest(availabilitySchemas.update),
  availabilityController.updateAvailability
);

router.delete(
  "/:id",
  auth(Role.TECHNICIAN),
  validateRequest(availabilitySchemas.idParam, "params"),
  availabilityController.deleteAvailability
);

export const availabilityRoutes = router;