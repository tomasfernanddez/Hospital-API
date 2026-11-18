import { Op } from "sequelize";
import { User } from "../models/user.model.js";
import { toUserResponse } from "../dtos/user.dto.js";
import { AppError } from "../errors/app-error.js";

const userNotFound = () =>
  new AppError("User not found", { status: 404, code: "USER_NOT_FOUND" });

export const list = async (req, res) => {
  const users = await User.findAll({ order: [["id", "ASC"]] });

  res.json({ data: users.map(toUserResponse) });
};

export const search = async (req, res) => {
  const keywords = String(req.query.keywords ?? "").trim();

  if (!keywords) {
    return res.json({ data: [] });
  }

  const pattern = `%${keywords}%`;

  const users = await User.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: pattern } },
        { email: { [Op.iLike]: pattern } },
      ],
    },
    order: [["id", "ASC"]],
  });

  res.json({ data: users.map(toUserResponse) });
};

export const getById = async (req, res) => {
  const user = await User.findByPk(req.userId);

  if (!user) {
    throw userNotFound();
  }

  res.json({ data: toUserResponse(user) });
};

export const create = async (req, res) => {
  const user = await User.create(req.dto);

  res
    .status(201)
    .location(`/api/users/${user.id}`)
    .json({ data: toUserResponse(user) });
};

export const update = async (req, res) => {
  const user = await User.findByPk(req.userId);

  if (!user) {
    throw userNotFound();
  }

  await user.update(req.dto);

  res.json({ data: toUserResponse(user) });
};

export const remove = async (req, res) => {
  const user = await User.findByPk(req.userId);

  if (!user) {
    throw userNotFound();
  }

  await user.destroy();

  res.status(204).send();
};