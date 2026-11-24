
export const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedQuery = await schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: false,
      });

      req.validatedQuery = validatedQuery;

      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: error.errors,
          },
        });
      }

      next(error);
    }
  };
};
