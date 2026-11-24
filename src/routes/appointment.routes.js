
import { Router } from "express";

import {
  listAppointments,
  searchAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller.js";

import { validateBody } from "../middlewares/validate-body.middleware.js";
import { validateId } from "../middlewares/validate-id.middleware.js";
import { validateQuery } from "../middlewares/validate-query.middleware.js";

import {
  createAppointmentDto,
  updateAppointmentDto,
  searchAppointmentDto,
} from "../dtos/appointment.dto.js";

export const appointmentRouter = Router();

// Buscar turnos con filtros combinables
appointmentRouter.get(
  "/search",
  validateQuery(searchAppointmentDto),
  searchAppointments,
);

// Listar todos los turnos
appointmentRouter.get("/", listAppointments);

// Obtener un turno por ID
appointmentRouter.get(
  "/:id",
  validateId("Appointment"),
  getAppointmentById,
);

// Crear un turno
appointmentRouter.post(
  "/",
  validateBody(createAppointmentDto),
  createAppointment,
);

// Actualizar o cancelar un turno
appointmentRouter.patch(
  "/:id",
  validateId("Appointment"),
  validateBody(updateAppointmentDto),
  updateAppointment,
);

// Eliminar un turno
appointmentRouter.delete(
  "/:id",
  validateId("Appointment"),
  deleteAppointment,
);
