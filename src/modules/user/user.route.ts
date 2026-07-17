import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";

import { userController } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userSchemas } from "../../utils/zodSchemas";

const router = Router();

// Public Routes
router.post(
  "/register",
  validateRequest(userSchemas.register),
  userController.registerUser
);

// Protected Routes
router.get(
  "/me",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  userController.getMyProfile
);

router.put(
  "/me",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  validateRequest(userSchemas.updateProfile),
  userController.updateMyProfile
);

export const userRoutes = router;