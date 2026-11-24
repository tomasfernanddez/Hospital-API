
import {
  describe,
  it,
  before,
  beforeEach,
  after,
} from "node:test";

import assert from "node:assert/strict";
import request from "supertest";

import { createApp } from "../src/app.js";
import { Specialty } from "../src/models/index.js";

import {
  setupTestDatabase,
  cleanTestDatabase,
  closeTestDatabase,
} from "./setup.js";

const app = createApp();

const DATE_1 = "2026-12-10T14:30:00-03:00";
const DATE_2 = "2026-12-11T15:30:00-03:00";
const DATE_3 = "2026-12-12T16:30:00-03:00";

let patientId;
let doctorId;
let specialtyId;

// Crea un recurso y exige que la API responda 201.
async function createResource(path, body) {
  const response = await request(app)
    .post(path)
    .send(body);

  assert.equal(
    response.status,
    201,
    `Error creando ${path}: ${JSON.stringify(response.body)}`,
  );

  return response.body.data;
}

// Crea un turno de prueba.
async function createAppointment({
  patient = patientId,
  doctor = doctorId,
  scheduledAt = DATE_1,
} = {}) {
  return createResource("/api/appointments", {
    patientId: patient,
    doctorId: doctor,
    scheduledAt,
    durationMinutes: 30,
    reason: "Control general",
  });
}

// Genera un segundo paciente.
async function createSecondPatient() {
  return createResource("/api/patients", {
    firstName: "Alan",
    lastName: "Turing",
    documentNumber: "87654321",
    birthDate: "1980-06-23",
  });
}

// Genera un segundo medico.
async function createSecondDoctor() {
  return createResource("/api/doctors", {
    firstName: "James",
    lastName: "Wilson",
    licenseNumber: "MN-87654321",
    specialtyId,
  });
}

describe("Appointments API", () => {
  before(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();

    const specialty = await Specialty.create({
      name: "Cardiología",
    });

    specialtyId = specialty.id;

    const patient = await createResource("/api/patients", {
      firstName: "Ada",
      lastName: "Lovelace",
      documentNumber: "12345678",
      birthDate: "1985-12-10",
    });

    const doctor = await createResource("/api/doctors", {
      firstName: "Gregory",
      lastName: "House",
      licenseNumber: "MN-12345678",
      specialtyId,
    });

    patientId = patient.id;
    doctorId = doctor.id;
  });

  after(async () => {
    await closeTestDatabase();
  });

  // ==========================================
  // CREACION Y CONSULTA
  // ==========================================

  it("POST crea un turno con paciente y medico anidados", async () => {
    const appointment = await createAppointment();

    assert.ok(appointment.id);
    assert.equal(appointment.status, "SCHEDULED");

    assert.equal(appointment.patient.id, patientId);
    assert.equal(appointment.doctor.id, doctorId);

    assert.equal(appointment.createdAt, undefined);
    assert.equal(appointment.updatedAt, undefined);
  });

  it("GET /api/appointments/:id devuelve el turno", async () => {
    const created = await createAppointment();

    const response = await request(app)
      .get(`/api/appointments/${created.id}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, created.id);
    assert.equal(response.body.data.patient.id, patientId);
    assert.equal(response.body.data.doctor.id, doctorId);
  });

  it("POST rechaza un horario ocupado del mismo medico", async () => {
    await createAppointment();

    const response = await request(app)
      .post("/api/appointments")
      .send({
        patientId,
        doctorId,
        scheduledAt: DATE_1,
        durationMinutes: 30,
        reason: "Segundo turno",
      });

    assert.equal(response.status, 409);
    assert.equal(
      response.body.error.code,
      "DOCTOR_SLOT_TAKEN",
    );
  });

  it("POST rechaza un paciente inexistente", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .send({
        patientId: 2147483647,
        doctorId,
        scheduledAt: DATE_1,
        durationMinutes: 30,
      });

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error.code,
      "INVALID_REFERENCE",
    );
  });

  // ==========================================
  // FILTROS DE BUSQUEDA
  // ==========================================

  it("SEARCH filtra correctamente por doctorId", async () => {
    const secondDoctor = await createSecondDoctor();

    const first = await createAppointment({
      scheduledAt: DATE_1,
    });

    const second = await createAppointment({
      scheduledAt: DATE_2,
    });

    await createAppointment({
      doctor: secondDoctor.id,
      scheduledAt: DATE_3,
    });

    const response = await request(app)
      .get("/api/appointments/search")
      .query({ doctorId });

    assert.equal(response.status, 200);

    const ids = response.body.data.map((item) => item.id);

    assert.deepEqual(
      ids.sort((a, b) => a - b),
      [first.id, second.id].sort((a, b) => a - b),
    );
  });

  it("SEARCH filtra por fecha incluyendo la hora", async () => {
    const expected = await createAppointment({
      scheduledAt: DATE_1,
    });

    await createAppointment({
      scheduledAt: DATE_2,
    });

    const response = await request(app)
      .get("/api/appointments/search")
      .query({ date: "2026-12-10" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].id, expected.id);
  });

  it("SEARCH filtra por numero de documento", async () => {
    const secondPatient = await createSecondPatient();

    const expected = await createAppointment();

    await createAppointment({
      patient: secondPatient.id,
      scheduledAt: DATE_2,
    });

    const response = await request(app)
      .get("/api/appointments/search")
      .query({ documentNumber: "12345678" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].id, expected.id);
  });

  it("SEARCH filtra por nombre del paciente", async () => {
    const secondPatient = await createSecondPatient();

    const expected = await createAppointment();

    await createAppointment({
      patient: secondPatient.id,
      scheduledAt: DATE_2,
    });

    const response = await request(app)
      .get("/api/appointments/search")
      .query({ patientName: "Ada" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].id, expected.id);
  });

  it("SEARCH combina los filtros con AND", async () => {
    const secondPatient = await createSecondPatient();

    const expected = await createAppointment();

    await createAppointment({
      patient: secondPatient.id,
      scheduledAt: DATE_2,
    });

    const response = await request(app)
      .get("/api/appointments/search")
      .query({
        doctorId,
        date: "2026-12-10",
        documentNumber: "12345678",
        patientName: "Ada",
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].id, expected.id);
  });

  it("SEARCH rechaza doctorId invalido", async () => {
    const response = await request(app)
      .get("/api/appointments/search")
      .query({ doctorId: "abc" });

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error.code,
      "VALIDATION_ERROR",
    );
  });

  // ==========================================
  // CANCELACION Y ESTADOS
  // ==========================================

  it("PATCH cancela un turno y registra cancelledAt", async () => {
    const appointment = await createAppointment();

    const response = await request(app)
      .patch(`/api/appointments/${appointment.id}`)
      .send({ status: "CANCELLED" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.status, "CANCELLED");

    assert.ok(response.body.data.cancelledAt);

    const saved = await request(app)
      .get(`/api/appointments/${appointment.id}`);

    assert.equal(saved.status, 200);
    assert.equal(saved.body.data.status, "CANCELLED");
    assert.ok(saved.body.data.cancelledAt);
  });

  it("PATCH rechaza cancelar dos veces el mismo turno", async () => {
    const appointment = await createAppointment();

    const first = await request(app)
      .patch(`/api/appointments/${appointment.id}`)
      .send({ status: "CANCELLED" });

    assert.equal(first.status, 200);

    const second = await request(app)
      .patch(`/api/appointments/${appointment.id}`)
      .send({ status: "CANCELLED" });

    assert.equal(second.status, 409);

    assert.equal(
      second.body.error.code,
      "APPOINTMENT_ALREADY_CANCELLED",
    );
  });

  // ==========================================
  // ORDEN Y RESTRICCIONES
  // ==========================================

  it("GET /api/appointments ordena por fecha ascendente", async () => {
    await createAppointment({ scheduledAt: DATE_3 });
    await createAppointment({ scheduledAt: DATE_1 });
    await createAppointment({ scheduledAt: DATE_2 });

    const response = await request(app)
      .get("/api/appointments");

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 3);

    const timestamps = response.body.data.map((item) =>
      new Date(item.scheduledAt).getTime()
    );

    assert.deepEqual(
      timestamps,
      [...timestamps].sort((a, b) => a - b),
    );
  });

  it("DELETE impide eliminar pacientes con turnos", async () => {
    await createAppointment();

    const response = await request(app)
      .delete(`/api/patients/${patientId}`);

    assert.equal(response.status, 409);

    assert.equal(
      response.body.error.code,
      "PATIENT_HAS_APPOINTMENTS",
    );
  });

  it("DELETE elimina un turno y luego devuelve 404", async () => {
    const appointment = await createAppointment();

    const deleted = await request(app)
      .delete(`/api/appointments/${appointment.id}`);

    assert.equal(deleted.status, 204);
    assert.equal(deleted.text, "");

    const response = await request(app)
      .get(`/api/appointments/${appointment.id}`);

    assert.equal(response.status, 404);
  });
});
