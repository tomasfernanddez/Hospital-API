import * as yup from "yup";

export const validateBody = (schema) => async (req, res, next) => {
  try {
    req.dto = await schema.validate(req.body ?? {}, {
      abortEarly: false,
      stripUnknown: false,
    });
    next();
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return next(error);
    }

    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: error.errors,
      },
    });
  }
};