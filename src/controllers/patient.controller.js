
import { Op, ForeignKeyConstraintError } from "sequelize";

import { Patient } from "../models/index.js";
import { AppError } from "../errors/app-error.js";
import { toPatientResponse } from "../dtos/patient.dto.js";

// GET /api/patients
export const listPatients = async (req, res) => {
  const patients = await Patient.findAll({
    order: [["id", "ASC"]],
  });

  res.json({
    data: patients.map(toPatientResponse),
  });
};

// GET /api/patients/search?keywords=ada
export const searchPatients = async (req, res) => {
  const keywords = String(req.query.keywords ?? "").trim();

  const patients = await Patient.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${keywords}%` } },
        { lastName: { [Op.iLike]: `%${keywords}%` } },
      ],
    },
    order: [["id", "ASC"]],
  });

  res.json({
    data: patients.map(toPatientResponse),
  });
};

// GET /api/patients/:id
export const getPatientById = async (req, res) => {
  const patient = await Patient.findByPk(req.resourceId);

  if (!patient) {
    throw new AppError("Patient not found", {
      status: 404,
      code: "PATIENT_NOT_FOUND",
    });
  }

  res.json({
    data: toPatientResponse(patient),
  });
};

// POST /api/patients
export const createPatient = async (req, res) => {
  const patient = await Patient.create(req.dto);

  res
    .status(201)
    .location(`/api/patients/${patient.id}`)
    .json({
      data: toPatientResponse(patient),
    });
};

// PATCH /api/patients/:id
export const updatePatient = async (req, res) => {
  const patient = await Patient.findByPk(req.resourceId);

  if (!patient) {
    throw new AppError("Patient not found", {
      status: 404,
      code: "PATIENT_NOT_FOUND",
    });
  }

  await patient.update(req.dto);

  res.json({
    data: toPatientResponse(patient),
  });
};

// DELETE /api/patients/:id
export const deletePatient = async (req, res) => {
  const patient = await Patient.findByPk(req.resourceId);

  if (!patient) {
    throw new AppError("Patient not found", {
      status: 404,
      code: "PATIENT_NOT_FOUND",
    });
  }

  try {
    await patient.destroy();
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      throw new AppError(
        "Patient has appointments and cannot be deleted",
        {
          status: 409,
          code: "PATIENT_HAS_APPOINTMENTS",
        },
      );
    }

    throw error;
  }

  res.status(204).end();
};
