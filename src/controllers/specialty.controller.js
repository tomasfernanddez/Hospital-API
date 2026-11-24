
import { Specialty } from "../models/index.js";
import { AppError } from "../errors/app-error.js";
import { toSpecialtyResponse } from "../dtos/specialty.dto.js";

// GET /api/specialties
export const listSpecialties = async (req, res) => {
  const specialties = await Specialty.findAll({
    order: [["id", "ASC"]],
  });

  res.json({
    data: specialties.map(toSpecialtyResponse),
  });
};

// GET /api/specialties/:id
export const getSpecialtyById = async (req, res) => {
  const specialty = await Specialty.findByPk(req.resourceId);

  if (!specialty) {
    throw new AppError("Specialty not found", {
      status: 404,
      code: "SPECIALTY_NOT_FOUND",
    });
  }

  res.json({
    data: toSpecialtyResponse(specialty),
  });
};
