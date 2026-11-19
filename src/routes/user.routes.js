import { Router } from "express";
import * as controller from "../controllers/user.controller.js";
import { validateBody } from "../middlewares/validate-body.middleware.js";
import { validateUserId } from "../middlewares/validate-id.middleware.js";
import { requireRole } from "../middlewares/require-role.middleware.js";
import {
  createUserDto,
  updateUserDto,
  assignRoleDto,
} from "../dtos/user.dto.js";

export const userRouter = Router();

// /search va ANTES de /:id, o Express lo interpreta como un id
userRouter.get("/search", controller.search);
userRouter.get("/", controller.list);
userRouter.get("/:id", validateUserId, controller.getById);
userRouter.post("/", validateBody(createUserDto), controller.create);
userRouter.patch(
  "/:id",
  validateUserId,
  validateBody(updateUserDto),
  controller.update,
);
userRouter.delete("/:id", validateUserId, controller.remove);
userRouter.patch(
  "/:id/role",
  requireRole("ROLE_ADMIN"),
  validateUserId,
  validateBody(assignRoleDto),
  controller.assignRole,
);