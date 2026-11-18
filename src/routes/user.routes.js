import { Router } from "express";
import * as controller from "../controllers/user.controller.js";
import { validateBody } from "../middlewares/validate-body.middleware.js";
import { validateUserId } from "../middlewares/validate-id.middleware.js";
import { createUserDto, updateUserDto } from "../dtos/user.dto.js";

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