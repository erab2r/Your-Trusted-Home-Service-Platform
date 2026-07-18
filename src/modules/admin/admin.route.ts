import express from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminSchemas } from "../../utils/zodSchemas";
import { adminController } from "./admin.controller";

const router = express.Router();

router.get(
  "/users",
  auth(Role.ADMIN),
  adminController.getAllUsers
);
router.get(
  "/users/:id",
  auth(Role.ADMIN),
  validateRequest(adminSchemas.userIdParam, "params"),
  adminController.getUserById
);

router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  validateRequest(adminSchemas.userIdParam, "params"),
  validateRequest(adminSchemas.userStatus),
  adminController.updateUserStatus
);

router.get(
  "/bookings",
  auth(Role.ADMIN),
  adminController.getAllBookings
);

router.get(
  "/bookings/:bookingId",
  auth(Role.ADMIN),
  validateRequest(adminSchemas.bookingIdParam, "params"),
  adminController.getBookingById
);


export const adminRoutes = router;