import { UniqueConstraintError, ValidationError } from "sequelize";

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // JSON mal formado: lo lanza express.json()
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body is not valid JSON",
      },
    });
  }

  // La base rechazó un UNIQUE (email repetido)
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: {
        code: "EMAIL_TAKEN",
        message: "Email is already registered",
      },
    });
  }

  // La base rechazó una validación del modelo
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid user data",
        details: error.errors.map((item) => item.message),
      },
    });
  }

  const status = error.status ?? 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      code: error.code ?? "INTERNAL_ERROR",
      message: status >= 500 ? "Unexpected server error" : error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
};