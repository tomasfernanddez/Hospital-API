
import { Router } from "express";

import * as controller from "../controllers/patient.controller.js";

import { validateBody } from "../middlewares/validate-body.middleware.js";
import { validateId } from "../middlewares/validate-id.middleware.js";

import {
  createPatientDto,
  updatePatientDto,
} from "../dtos/patient.dto.js";

export const patientRouter = Router();

// Buscar pacientes
patientRouter.get("/search", controller.searchPatients);

// Listar todos los pacientes
patientRouter.get("/", controller.listPatients);

// Obtener un paciente por ID
patientRouter.get(
  "/:id",
  validateId("Patient"),
  controller.getPatientById,
);

// Crear un paciente
patientRouter.post(
  "/",
  validateBody(createPatientDto),
  controller.createPatient,
);

// Actualizar un paciente
patientRouter.patch(
  "/:id",
  validateId("Patient"),
  validateBody(updatePatientDto),
  controller.updatePatient,
);

// Eliminar un paciente
patientRouter.delete(
  "/:id",
  validateId("Patient"),
  controller.deletePatient,
);
