
import { ValidationError } from "yup";

import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError as SequelizeValidationError,
} from "sequelize";

// Codigos de error segun el campo UNIQUE
const UNIQUE_CODES = {
  document_number: "DOCUMENT_NUMBER_TAKEN",
  documentNumber: "DOCUMENT_NUMBER_TAKEN",

  license_number: "LICENSE_NUMBER_TAKEN",
  licenseNumber: "LICENSE_NUMBER_TAKEN",

  name: "SPECIALTY_NAME_TAKEN",
  email: "EMAIL_TAKEN",
};

// Codigos de error segun la restriccion SQL
const CONSTRAINT_CODES = {
  appointments_doctor_slot_unique: "DOCTOR_SLOT_TAKEN",
};

// Mensajes para los conflictos
const CONFLICT_MESSAGES = {
  DOCUMENT_NUMBER_TAKEN:
    "Document number is already registered",

  LICENSE_NUMBER_TAKEN:
    "License number is already registered",

  SPECIALTY_NAME_TAKEN:
    "Specialty name is already registered",

  EMAIL_TAKEN:
    "Email is already registered",

  DOCTOR_SLOT_TAKEN:
    "Doctor already has an appointment at that time",

  DUPLICATE_VALUE:
    "Value is already registered",
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // ------------------------------------------
  // JSON MAL FORMADO
  // ------------------------------------------

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body is not valid JSON",
      },
    });
  }

  // ------------------------------------------
  // VALIDACIONES DE YUP
  // ------------------------------------------

  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: error.errors,
      },
    });
  }

  // ------------------------------------------
  // CAMPOS UNIQUE DUPLICADOS
  // ------------------------------------------

  if (error instanceof UniqueConstraintError) {
    const constraint = error.parent?.constraint;

    const field =
      Object.keys(error.fields ?? {})[0] ??
      error.errors?.[0]?.path;

    const code =
      CONSTRAINT_CODES[constraint] ??
      UNIQUE_CODES[field] ??
      "DUPLICATE_VALUE";

    return res.status(409).json({
      error: {
        code,
        message:
          CONFLICT_MESSAGES[code] ??
          CONFLICT_MESSAGES.DUPLICATE_VALUE,
      },
    });
  }

  // ------------------------------------------
  // REFERENCIAS INEXISTENTES
  // ------------------------------------------

  if (error instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      error: {
        code: "INVALID_REFERENCE",
        message: "Referenced resource does not exist",
      },
    });
  }

  // ------------------------------------------
  // VALIDACIONES DE SEQUELIZE
  // ------------------------------------------

  if (error instanceof SequelizeValidationError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: error.errors.map((item) => item.message),
      },
    });
  }

  // ------------------------------------------
  // ERRORES PERSONALIZADOS Y GENERALES
  // ------------------------------------------

  const status = error.status ?? 500;

  if (status >= 500) {
    console.error(`${error.name}: ${error.message}`);
  }

  return res.status(status).json({
    error: {
      code: error.code ?? "INTERNAL_ERROR",
      message:
        status >= 500
          ? "Unexpected server error"
          : error.message,
      ...(error.details
        ? { details: error.details }
        : {}),
    },
  });
};
