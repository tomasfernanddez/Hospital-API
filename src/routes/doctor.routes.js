
import { Router } from "express";

import {
  listDoctors,
  searchDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctor.controller.js";

import { validateBody } from "../middlewares/validate-body.middleware.js";
import { validateId } from "../middlewares/validate-id.middleware.js";

import {
  createDoctorDto,
  updateDoctorDto,
} from "../dtos/doctor.dto.js";

export const doctorRouter = Router();

// Buscar médicos
doctorRouter.get("/search", searchDoctors);

// Listar todos los médicos
doctorRouter.get("/", listDoctors);

// Obtener un médico por ID
doctorRouter.get(
  "/:id",
  validateId("Doctor"),
  getDoctorById,
);

// Crear un médico
doctorRouter.post(
  "/",
  validateBody(createDoctorDto),
  createDoctor,
);

// Actualizar un médico
doctorRouter.patch(
  "/:id",
  validateId("Doctor"),
  validateBody(updateDoctorDto),
  updateDoctor,
);

// Eliminar un médico
doctorRouter.delete(
  "/:id",
  validateId("Doctor"),
  deleteDoctor,
);
