
import {
  Op,
  ForeignKeyConstraintError,
} from "sequelize";

import { Doctor, Specialty } from "../models/index.js";
import { AppError } from "../errors/app-error.js";
import { toDoctorResponse } from "../dtos/doctor.dto.js";

// Configuracion para incluir la especialidad
const withSpecialty = {
  model: Specialty,
  as: "specialty",
};

// GET /api/doctors
export const listDoctors = async (req, res) => {
  const doctors = await Doctor.findAll({
    include: withSpecialty,
    order: [["id", "ASC"]],
  });

  res.json({
    data: doctors.map(toDoctorResponse),
  });
};

// GET /api/doctors/search?keywords=house
export const searchDoctors = async (req, res) => {
  const keywords = String(req.query.keywords ?? "").trim();

  const doctors = await Doctor.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${keywords}%` } },
        { lastName: { [Op.iLike]: `%${keywords}%` } },
      ],
    },
    include: withSpecialty,
    order: [["id", "ASC"]],
  });

  res.json({
    data: doctors.map(toDoctorResponse),
  });
};

// GET /api/doctors/:id
export const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findByPk(req.resourceId, {
    include: withSpecialty,
  });

  if (!doctor) {
    throw new AppError("Doctor not found", {
      status: 404,
      code: "DOCTOR_NOT_FOUND",
    });
  }

  res.json({
    data: toDoctorResponse(doctor),
  });
};

// POST /api/doctors
export const createDoctor = async (req, res) => {
  const doctor = await Doctor.create(req.dto);

  // Cargar la especialidad asociada
  await doctor.reload({
    include: withSpecialty,
  });

  res
    .status(201)
    .location(`/api/doctors/${doctor.id}`)
    .json({
      data: toDoctorResponse(doctor),
    });
};

// PATCH /api/doctors/:id
export const updateDoctor = async (req, res) => {
  const doctor = await Doctor.findByPk(req.resourceId);

  if (!doctor) {
    throw new AppError("Doctor not found", {
      status: 404,
      code: "DOCTOR_NOT_FOUND",
    });
  }

  await doctor.update(req.dto);

  // Recargar para incluir la especialidad actualizada
  await doctor.reload({
    include: withSpecialty,
  });

  res.json({
    data: toDoctorResponse(doctor),
  });
};

// DELETE /api/doctors/:id
export const deleteDoctor = async (req, res) => {
  const doctor = await Doctor.findByPk(req.resourceId);

  if (!doctor) {
    throw new AppError("Doctor not found", {
      status: 404,
      code: "DOCTOR_NOT_FOUND",
    });
  }

  try {
    await doctor.destroy();
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      throw new AppError(
        "Doctor has appointments and cannot be deleted",
        {
          status: 409,
          code: "DOCTOR_HAS_APPOINTMENTS",
        },
      );
    }

    throw error;
  }

  res.status(204).end();
};
