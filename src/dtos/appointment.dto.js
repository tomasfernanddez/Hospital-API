
import * as yup from "yup";

// Estados permitidos
const appointmentStatuses = [
  "SCHEDULED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
];

// Fecha y hora ISO 8601 con zona horaria
const scheduledAtSchema = yup
  .string()
  .required()
  .test(
    "valid-datetime",
    "scheduledAt must be a valid ISO 8601 timestamp with offset",
    (value) => {
      // Permitir ausencia cuando el schema se usa
      // como campo opcional en un PATCH.
      if (value === undefined) return true;

      return (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
        !Number.isNaN(Date.parse(value))
      );
    },
  );

// Campos compartidos
const appointmentFields = {
  doctorId: yup
    .number()
    .integer()
    .positive()
    .required(),

  scheduledAt: scheduledAtSchema,

  durationMinutes: yup
    .number()
    .integer()
    .min(5)
    .max(240)
    .default(30),

  reason: yup
    .string()
    .trim()
    .min(3)
    .max(255)
    .nullable()
    .optional(),
};

// POST /api/appointments
export const createAppointmentDto = yup
  .object({
    patientId: yup
      .number()
      .integer()
      .positive()
      .required(),

    ...appointmentFields,
  })
  .strict()
  .noUnknown(true);

// PATCH /api/appointments/:id
export const updateAppointmentDto = yup
  .object({
    doctorId: appointmentFields.doctorId.optional(),
    scheduledAt: appointmentFields.scheduledAt.optional(),
    durationMinutes: appointmentFields.durationMinutes.optional(),
    reason: appointmentFields.reason,
    status: yup
      .string()
      .oneOf(appointmentStatuses)
      .optional(),
  })
  .strict()
  .noUnknown(true)
  .test(
    "at-least-one-field",
    "At least one field is required",
    (value) => Object.keys(value ?? {}).length > 0,
  );

// GET /api/appointments/search
export const searchAppointmentDto = yup
  .object({
    doctorId: yup
      .number()
      .integer()
      .positive()
      .optional(),

    date: yup
        .string()
        .matches(
            /^\d{4}-\d{2}-\d{2}$/,
            "Date must use YYYY-MM-DD",
        )
        .test(
          "valid-date",
          "Date must be a valid calendar date",
          (value) => {
            if (value === undefined) return true;

            const date = new Date(`${value}T00:00:00Z`);

            return (
              !Number.isNaN(date.getTime()) &&
              date.toISOString().slice(0, 10) === value
            );
          },
        )
        .optional(),

    documentNumber: yup
      .string()
      .matches(
        /^[0-9]{7,10}$/,
        "Document number must contain 7 to 10 digits",
      )
      .optional(),

    patientName: yup
      .string()
      .trim()
      .min(2)
      .optional(),
  })
  .noUnknown(true);

// DTO de salida
export const toAppointmentResponse = (appointment) => ({
  id: appointment.id,
  scheduledAt: appointment.scheduledAt,
  durationMinutes: appointment.durationMinutes,
  reason: appointment.reason,
  status: appointment.status,
  cancelledAt: appointment.cancelledAt,

  patient: appointment.patient
    ? {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
      }
    : null,

  doctor: appointment.doctor
    ? {
        id: appointment.doctor.id,
        firstName: appointment.doctor.firstName,
        lastName: appointment.doctor.lastName,
      }
    : null,
});
