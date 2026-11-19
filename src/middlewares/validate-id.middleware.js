export const validateUserId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: {
        code: "INVALID_ID",
        message: "User id must be a positive integer",
      },
    });
  }

  req.userId = id;
  next();
};