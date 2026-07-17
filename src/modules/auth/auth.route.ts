import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { authSchemas } from "../../utils/zodSchemas";
import { authController } from "./auth.controller";

const router = Router();

router.post(
  "/login",
  validateRequest(authSchemas.login),
  authController.loginUser
);

router.post("/refresh-token", authController.refreshToken);

export const authRoutes = router;