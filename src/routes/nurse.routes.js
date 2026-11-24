
import { Router } from "express";

import {
  listNurses,
  searchNurses,
  getNurseById,
  createNurse,
  updateNurse,
  deleteNurse,
} from "../controllers/nurse.controller.js";

import { validateBody } from "../middlewares/validate-body.middleware.js";
import { validateId } from "../middlewares/validate-id.middleware.js";

import {
  createNurseDto,
  updateNurseDto,
} from "../dtos/nurse.dto.js";

export const nurseRouter = Router();

// Buscar enfermeros
nurseRouter.get("/search", searchNurses);

// Listar todos los enfermeros
nurseRouter.get("/", listNurses);

// Obtener un enfermero por ID
nurseRouter.get(
  "/:id",
  validateId("Nurse"),
  getNurseById,
);

// Crear un enfermero
nurseRouter.post(
  "/",
  validateBody(createNurseDto),
  createNurse,
);

// Actualizar un enfermero
nurseRouter.patch(
  "/:id",
  validateId("Nurse"),
  validateBody(updateNurseDto),
  updateNurse,
);

// Eliminar un enfermero
nurseRouter.delete(
  "/:id",
  validateId("Nurse"),
  deleteNurse,
);
