
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Patient extends Model {}

Patient.init(
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
    documentNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Document number cannot be empty" },
        is: {
          args: /^[0-9]{7,10}$/,
          msg: "Document number must contain 7 to 10 digits",
        },
      },
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: "Birth date must be a valid date (YYYY-MM-DD)" },
        isBefore: {
          args: new Date().toISOString().slice(0, 10),
          msg: "Birth date must be in the past",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "patients",
    underscored: true,
    timestamps: true,
  },
);
