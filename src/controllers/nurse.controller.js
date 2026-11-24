
import { Op } from "sequelize";

import { Nurse } from "../models/index.js";
import { AppError } from "../errors/app-error.js";
import { toNurseResponse } from "../dtos/nurse.dto.js";

// GET /api/nurses
export const listNurses = async (req, res) => {
  const nurses = await Nurse.findAll({
    order: [["id", "ASC"]],
  });

  res.json({
    data: nurses.map(toNurseResponse),
  });
};

// GET /api/nurses/search?keywords=florence
export const searchNurses = async (req, res) => {
  const keywords = String(req.query.keywords ?? "").trim();

  const nurses = await Nurse.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${keywords}%` } },
        { lastName: { [Op.iLike]: `%${keywords}%` } },
      ],
    },
    order: [["id", "ASC"]],
  });

  res.json({
    data: nurses.map(toNurseResponse),
  });
};

// GET /api/nurses/:id
export const getNurseById = async (req, res) => {
  const nurse = await Nurse.findByPk(req.resourceId);

  if (!nurse) {
    throw new AppError("Nurse not found", {
      status: 404,
      code: "NURSE_NOT_FOUND",
    });
  }

  res.json({
    data: toNurseResponse(nurse),
  });
};

// POST /api/nurses
export const createNurse = async (req, res) => {
  const nurse = await Nurse.create(req.dto);

  res
    .status(201)
    .location(`/api/nurses/${nurse.id}`)
    .json({
      data: toNurseResponse(nurse),
    });
};

// PATCH /api/nurses/:id
export const updateNurse = async (req, res) => {
  const nurse = await Nurse.findByPk(req.resourceId);

  if (!nurse) {
    throw new AppError("Nurse not found", {
      status: 404,
      code: "NURSE_NOT_FOUND",
    });
  }

  await nurse.update(req.dto);

  res.json({
    data: toNurseResponse(nurse),
  });
};

// DELETE /api/nurses/:id
export const deleteNurse = async (req, res) => {
  const nurse = await Nurse.findByPk(req.resourceId);

  if (!nurse) {
    throw new AppError("Nurse not found", {
      status: 404,
      code: "NURSE_NOT_FOUND",
    });
  }

  await nurse.destroy();

  res.status(204).end();
};
