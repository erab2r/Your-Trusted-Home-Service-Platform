import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { technicianController } from "./technician.controller";

const router = Router();

router.get(
  "/profile/me",
  auth(Role.TECHNICIAN),
  technicianController.getMyTechnicianProfile
);

router.patch(
  "/profile",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianProfile 
);

router.get("/", technicianController.getAllTechnicians);

router.get("/:id", technicianController.getTechnicianById);

export const technicianRoutes = router;