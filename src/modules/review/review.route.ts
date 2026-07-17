import express from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { reviewSchemas } from "../../utils/zodSchemas";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(reviewSchemas.create),
  reviewController.createReview
);
router.get(
  "/me",
  auth(Role.CUSTOMER),
  reviewController.getMyReviews
);
router.get(
  "/technician-reviews/:technicianId",
  reviewController.getTechnicianReviews
);

export const reviewRoutes = router;