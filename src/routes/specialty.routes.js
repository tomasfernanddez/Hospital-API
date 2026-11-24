
import { Router } from "express";

import {
  listSpecialties,
  getSpecialtyById,
} from "../controllers/specialty.controller.js";

import { validateId } from "../middlewares/validate-id.middleware.js";

export const specialtyRouter = Router();

// Listar todas las especialidades
specialtyRouter.get("/", listSpecialties);

// Obtener una especialidad por ID
specialtyRouter.get(
  "/:id",
  validateId("Specialty"),
  getSpecialtyById,
);
