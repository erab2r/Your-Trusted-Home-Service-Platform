import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { categorySchemas } from "../../utils/zodSchemas";
import { categoryController } from "./category.controller";

const router = Router();

// Public Route
router.get(
  "/",
  categoryController.getAllCategories
);

// Admin Routes
router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(categorySchemas.create),
  categoryController.createCategory
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(categorySchemas.idParam, "params"),
  validateRequest(categorySchemas.update),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  categoryController.deleteCategory
);

export const categoryRoutes = router;