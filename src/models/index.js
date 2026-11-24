
import { sequelize } from "../config/database.js";

import { User } from "./user.model.js";
import { Specialty } from "./specialty.model.js";
import { Patient } from "./patient.model.js";
import { Doctor } from "./doctor.model.js";
import { Nurse } from "./nurse.model.js";
import { Appointment } from "./appointment.model.js";

// Una especialidad tiene muchos médicos.
Specialty.hasMany(Doctor, {
  foreignKey: { name: "specialtyId", allowNull: false },
  as: "doctors",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Un médico pertenece a una especialidad.
Doctor.belongsTo(Specialty, {
  foreignKey: { name: "specialtyId", allowNull: false },
  as: "specialty",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Un paciente puede tener muchos turnos.
Patient.hasMany(Appointment, {
  foreignKey: { name: "patientId", allowNull: false },
  as: "appointments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Cada turno pertenece a un paciente.
Appointment.belongsTo(Patient, {
  foreignKey: { name: "patientId", allowNull: false },
  as: "patient",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Un médico puede tener muchos turnos.
Doctor.hasMany(Appointment, {
  foreignKey: { name: "doctorId", allowNull: false },
  as: "appointments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Cada turno pertenece a un médico.
Appointment.belongsTo(Doctor, {
  foreignKey: { name: "doctorId", allowNull: false },
  as: "doctor",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

export {
  sequelize,
  User,
  Specialty,
  Patient,
  Doctor,
  Nurse,
  Appointment,
};
