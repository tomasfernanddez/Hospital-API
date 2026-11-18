import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { toUserResponse } from "../dtos/user.dto.js";
import { AppError } from "../errors/app-error.js";

const DUMMY_HASH = await bcrypt.hash("dummy-password-for-timing", 12);

const invalidCredentials = () =>
  new AppError("Invalid credentials", {
    status: 401,
    code: "INVALID_CREDENTIALS",
  });

export const login = async (req, res) => {
  const { email, password } = req.dto;
  const user = await User.findOne({ where: { email } });
  const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

    if (!user || !valid) {
        throw invalidCredentials();
    }

  res.json({ data: toUserResponse(user) });
};