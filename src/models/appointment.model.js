
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Appointment extends Model {}

Appointment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "patient_id",
      references: { model: "patients", key: "id" },
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "doctor_id",
      references: { model: "doctors", key: "id" },
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "scheduledAt must be a valid ISO 8601 timestamp",
        },
      },
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        isInt: { msg: "durationMinutes must be an integer" },
        min: {
          args: [5],
          msg: "durationMinutes must be at least 5",
        },
        max: {
          args: [240],
          msg: "durationMinutes must be at most 240",
        },
      },
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [3, 255],
          msg: "Reason must be between 3 and 255 characters",
        },
      },
    },
    status: {
      // Tipo ENUM nativo de PostgreSQL.
      type: "appointment_status",
      allowNull: false,
      defaultValue: "SCHEDULED",
      validate: {
        isIn: {
          args: [
            ["SCHEDULED", "CANCELLED", "COMPLETED", "NO_SHOW"],
          ],
          msg: "Invalid status",
        },
      },
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Appointment",
    tableName: "appointments",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["doctor_id", "scheduled_at"],
        name: "appointments_doctor_slot_unique",
      },
      { fields: ["patient_id"] },
      { fields: ["scheduled_at"] },
      { fields: ["status"] },
    ],
  },
);
