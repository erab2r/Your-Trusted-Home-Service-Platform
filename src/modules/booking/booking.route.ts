import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { bookingSchemas } from "../../utils/zodSchemas";
import { bookingController } from "./booking.controller";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(bookingSchemas.create),
  bookingController.createBooking
);

router.get(
  "/",
  auth(Role.CUSTOMER),
  bookingController.getMyBookings
);

router.get(
  "/technician",
  auth(Role.TECHNICIAN),
  bookingController.getTechnicianBookings
);

router.get(
  "/:bookingId",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  bookingController.getBookingById
);

router.patch(
  "/:bookingId/cancel",
  auth(Role.CUSTOMER),
  validateRequest(bookingSchemas.bookingParam, "params"),
  bookingController.cancelBooking
);

router.patch(
  "/:bookingId/update-status",
  auth(Role.TECHNICIAN),
  validateRequest(bookingSchemas.bookingParam, "params"),
  validateRequest(bookingSchemas.updateStatus),
  bookingController.updateBookingStatus
);

export const bookingRoutes = router;