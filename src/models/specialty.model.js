
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Specialty extends Model {}

Specialty.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Specialty name cannot be empty",
        },
        len: {
          args: [3, 80],
          msg: "Specialty name must be between 3 and 80 characters",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Specialty",
    tableName: "specialties",
    underscored: true,
    timestamps: true,
  },
);
