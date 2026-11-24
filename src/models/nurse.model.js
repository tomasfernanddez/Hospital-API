
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Nurse extends Model {}

Nurse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: { msg: "First name cannot be empty" },
        len: {
          args: [2, 120],
          msg: "First name must be between 2 and 120 characters",
        },
      },
    },
    lastName: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Last name cannot be empty" },
        len: {
          args: [2, 120],
          msg: "Last name must be between 2 and 120 characters",
        },
      },
    },
    licenseNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "License number cannot be empty" },
        len: {
          args: [4, 20],
          msg: "License number must be between 4 and 20 characters",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Nurse",
    tableName: "nurses",
    underscored: true,
    timestamps: true,
  },
);
