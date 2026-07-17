import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentSchemas } from "../../utils/zodSchemas";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create",
  auth(Role.CUSTOMER),
  validateRequest(paymentSchemas.createCheckoutSession),
  paymentController.createCheckoutSession
);

router.post(
  "/webhook",
  paymentController.handleWebhook
);

router.get(
  "/verify-session",
  auth(Role.CUSTOMER),
  validateRequest(paymentSchemas.verifySessionQuery, "query"),
  paymentController.verifyCheckoutSession
);

router.get(
  "/",
  auth(Role.CUSTOMER),
  paymentController.getMyPayments
);

router.get(
  "/:id",
  auth(Role.CUSTOMER),
  paymentController.getPaymentById
);

export const paymentRoutes = router;