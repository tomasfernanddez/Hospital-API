import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate-body.middleware.js";
import { loginDto } from "../dtos/auth.dto.js";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginDto), login);