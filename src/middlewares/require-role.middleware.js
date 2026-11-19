export const requireRole = (role) => (req, res, next) => {
  const currentRole = req.header("x-user-role");

  if (currentRole !== role) {
    return res.status(403).json({
      error: { code: "FORBIDDEN", message: "Insufficient permissions" },
    });
  }

  next();
};