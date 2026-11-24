
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

import {
  setupTestDatabase,
  cleanTestDatabase,
  closeTestDatabase,
} from "./setup.js";

const app = createApp();

const validPatient = {
  firstName: "Ada",
  lastName: "Lovelace",
  documentNumber: "12345678",
  birthDate: "1985-12-10",
};

describe("Patients API", () => {
  before(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  after(async () => {
    await closeTestDatabase();
  });

  it("POST /api/patients crea un paciente", async () => {
    const response = await request(app)
      .post("/api/patients")
      .send(validPatient);

    assert.equal(response.status, 201);
    assert.ok(response.body.data.id);

    assert.equal(
      response.body.data.firstName,
      "Ada",
    );

    assert.equal(
      response.headers.location,
      `/api/patients/${response.body.data.id}`,
    );

    // El DTO no debe exponer campos internos.
    assert.equal(
      response.body.data.createdAt,
      undefined,
    );

    assert.equal(
      response.body.data.updatedAt,
      undefined,
    );
  });

  it("POST /api/patients rechaza documentos duplicados", async () => {
    await request(app)
      .post("/api/patients")
      .send(validPatient);

    const response = await request(app)
      .post("/api/patients")
      .send(validPatient);

    assert.equal(response.status, 409);

    assert.equal(
      response.body.error.code,
      "DOCUMENT_NUMBER_TAKEN",
    );
  });

  it("POST /api/patients rechaza un body incompleto", async () => {
    const response = await request(app)
      .post("/api/patients")
      .send({
        firstName: "Ada",
      });

    assert.equal(response.status, 400);

    assert.equal(
      response.body.error.code,
      "VALIDATION_ERROR",
    );

    assert.ok(
      Array.isArray(response.body.error.details),
    );
  });

  it("GET /api/patients/:id devuelve un paciente existente", async () => {
    const created = await request(app)
      .post("/api/patients")
      .send(validPatient);

    assert.equal(created.status, 201);

    const patientId = created.body.data.id;

    const response = await request(app)
      .get(`/api/patients/${patientId}`);

    assert.equal(response.status, 200);

    assert.equal(
      response.body.data.id,
      patientId,
    );

    assert.equal(
      response.body.data.documentNumber,
      validPatient.documentNumber,
    );
  });

  it("GET /api/patients/:id devuelve 404 si no existe", async () => {
    const response = await request(app)
      .get("/api/patients/2147483647");

    assert.equal(response.status, 404);

    assert.equal(
      response.body.error.code,
      "PATIENT_NOT_FOUND",
    );
  });


  it("POST /api/patients rechaza campos desconocidos", async () => {
    const response = await request(app)
      .post("/api/patients")
      .send({
        ...validPatient,
        unexpectedField: "valor",
      });

    assert.equal(response.status, 400);

    assert.equal(
      response.body.error.code,
      "VALIDATION_ERROR",
    );
  });

  it("GET /api/patients devuelve pacientes ordenados por ID", async () => {
    await request(app)
      .post("/api/patients")
      .send(validPatient);

    await request(app)
      .post("/api/patients")
      .send({
        ...validPatient,
        firstName: "Alan",
        lastName: "Turing",
        documentNumber: "87654321",
      });

    const response = await request(app)
      .get("/api/patients");

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.equal(response.body.data.length, 2);

    const ids = response.body.data.map(
      (patient) => patient.id,
    );

    assert.deepEqual(
      ids,
      [...ids].sort((a, b) => a - b),
    );
  });

  it("GET /api/patients/abc rechaza un ID invalido", async () => {
    const response = await request(app)
      .get("/api/patients/abc");

    assert.equal(response.status, 400);

    assert.equal(
      response.body.error.code,
      "INVALID_ID",
    );
  });

  it("PATCH /api/patients/:id actualiza parcialmente", async () => {
    const created = await request(app)
      .post("/api/patients")
      .send(validPatient);

    const patientId = created.body.data.id;

    const response = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({
        lastName: "Lovelace-Test",
      });

    assert.equal(response.status, 200);

    assert.equal(
      response.body.data.lastName,
      "Lovelace-Test",
    );

    assert.equal(
      response.body.data.firstName,
      validPatient.firstName,
    );

    assert.equal(
      response.body.data.documentNumber,
      validPatient.documentNumber,
    );

    assert.equal(
      response.body.data.birthDate,
      validPatient.birthDate,
    );
  });

  it("PATCH /api/patients/:id rechaza un body vacio", async () => {
    const created = await request(app)
      .post("/api/patients")
      .send(validPatient);

    const patientId = created.body.data.id;

    const response = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({});

    assert.equal(response.status, 400);

    assert.equal(
      response.body.error.code,
      "VALIDATION_ERROR",
    );
  });

  it("DELETE /api/patients/:id elimina el paciente", async () => {
    const created = await request(app)
      .post("/api/patients")
      .send(validPatient);

    const patientId = created.body.data.id;

    const deleted = await request(app)
      .delete(`/api/patients/${patientId}`);

    assert.equal(deleted.status, 204);
    assert.equal(deleted.text, "");

    const response = await request(app)
      .get(`/api/patients/${patientId}`);

    assert.equal(response.status, 404);

    assert.equal(
      response.body.error.code,
      "PATIENT_NOT_FOUND",
    );
  });
});
