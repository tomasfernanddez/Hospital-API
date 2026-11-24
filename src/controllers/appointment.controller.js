
import { Op } from "sequelize";

import {
  Appointment,
  Patient,
  Doctor,
} from "../models/index.js";

import { AppError } from "../errors/app-error.js";

import {
  toAppointmentResponse,
} from "../dtos/appointment.dto.js";

// Asociaciones que incluimos en las respuestas.
const parties = [
  {
    model: Patient,
    as: "patient",
    attributes: ["id", "firstName", "lastName"],
  },
  {
    model: Doctor,
    as: "doctor",
    attributes: ["id", "firstName", "lastName"],
  },
];

// Orden cronologico de los turnos.
const appointmentOrder = [
  ["scheduledAt", "ASC"],
  ["id", "ASC"],
];

// GET /api/appointments
export const listAppointments = async (req, res) => {
  const appointments = await Appointment.findAll({
    include: parties,
    order: appointmentOrder,
  });

  res.json({
    data: appointments.map(toAppointmentResponse),
  });
};

// GET /api/appointments/search
export const searchAppointments = async (req, res) => {
  const {
    doctorId,
    date,
    documentNumber,
    patientName,
  } = req.validatedQuery;

  const where = {};
  const patientWhere = {};

  // Filtrar por medico.
  if (doctorId !== undefined) {
    where.doctorId = doctorId;
  }

  // Filtrar por fecha utilizando un rango.
  if (date !== undefined) {
    const start = new Date(`${date}T00:00:00Z`);

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    where.scheduledAt = {
      [Op.gte]: start,
      [Op.lt]: end,
    };
  }

  // Filtrar por documento del paciente.
  if (documentNumber !== undefined) {
    patientWhere.documentNumber = documentNumber;
  }

  // Filtrar por nombre o apellido.
  if (patientName !== undefined) {
    patientWhere[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${patientName}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${patientName}%`,
        },
      },
    ];
  }

  const hasPatientFilters =
    documentNumber !== undefined ||
    patientName !== undefined;

  const include = [
    {
      ...parties[0],
      ...(hasPatientFilters
        ? {
            where: patientWhere,
            required: true,
          }
        : {}),
    },
    parties[1],
  ];

  const appointments = await Appointment.findAll({
    where,
    include,
    order: appointmentOrder,
  });

  res.json({
    data: appointments.map(toAppointmentResponse),
  });
};

// GET /api/appointments/:id
export const getAppointmentById = async (req, res) => {
  const appointment = await Appointment.findByPk(
    req.resourceId,
    {
      include: parties,
    },
  );

  if (!appointment) {
    throw new AppError("Appointment not found", {
      status: 404,
      code: "APPOINTMENT_NOT_FOUND",
    });
  }

  res.json({
    data: toAppointmentResponse(appointment),
  });
};

// POST /api/appointments
export const createAppointment = async (req, res) => {
  const appointment = await Appointment.create(req.dto);

  // Cargar el paciente y el medico asociados.
  await appointment.reload({
    include: parties,
  });

  res
    .status(201)
    .location(`/api/appointments/${appointment.id}`)
    .json({
      data: toAppointmentResponse(appointment),
    });
};

// PATCH /api/appointments/:id
export const updateAppointment = async (req, res) => {
  const appointment = await Appointment.findByPk(
    req.resourceId,
    {
      include: parties,
    },
  );

  if (!appointment) {
    throw new AppError("Appointment not found", {
      status: 404,
      code: "APPOINTMENT_NOT_FOUND",
    });
  }

  const isCancelling = req.dto.status === "CANCELLED";

  // No se puede cancelar dos veces el mismo turno.
  if (
    isCancelling &&
    appointment.status === "CANCELLED"
  ) {
    throw new AppError(
      "Appointment is already cancelled",
      {
        status: 409,
        code: "APPOINTMENT_ALREADY_CANCELLED",
      },
    );
  }

  // La fecha de cancelacion la establece el servidor.
  await appointment.update({
    ...req.dto,
    ...(isCancelling
      ? { cancelledAt: new Date() }
      : {}),
  });

  await appointment.reload({
    include: parties,
  });

  res.json({
    data: toAppointmentResponse(appointment),
  });
};

// DELETE /api/appointments/:id
export const deleteAppointment = async (req, res) => {
  const appointment = await Appointment.findByPk(
    req.resourceId,
  );

  if (!appointment) {
    throw new AppError("Appointment not found", {
      status: 404,
      code: "APPOINTMENT_NOT_FOUND",
    });
  }

  await appointment.destroy();

  res.status(204).end();
};
