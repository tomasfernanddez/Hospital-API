
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

let specialtyId;

const validDoctor = () => ({
  firstName: "Gregory",
  lastName: "House",
  licenseNumber: "MN-12345678",
  specialtyId,
});

const validNurse = {
  firstName: "Florence",
  lastName: "Nightingale",
  licenseNumber: "EN-12345678",
};

describe("Doctors and Nurses API", () => {
  before(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();

    // Cada test tiene su propia especialidad.
    const specialty = await Specialty.create({
      name: "Cardiología",
    });

    specialtyId = specialty.id;
  });

  after(async () => {
    await closeTestDatabase();
  });

  // ==========================================
  // DOCTORS
  // ==========================================

  it("POST /api/doctors crea un medico", async () => {
    const response = await request(app)
      .post("/api/doctors")
      .send(validDoctor());

    assert.equal(response.status, 201);

    assert.ok(response.body.data.id);

    assert.equal(
      response.body.data.firstName,
      "Gregory",
    );

    assert.equal(
      response.body.data.licenseNumber,
      validDoctor().licenseNumber,
    );

    assert.equal(
      response.body.data.specialty.id,
      specialtyId,
    );

    assert.equal(
      response.body.data.specialty.name,
      "Cardiología",
    );

    assert.equal(
      response.body.data.createdAt,
      undefined,
    );
  });

  it("GET /api/doctors/:id devuelve especialidad anidada", async () => {
    const created = await request(app)
      .post("/api/doctors")
      .send(validDoctor());

    assert.equal(created.status, 201);

    const doctorId = created.body.data.id;

    const response = await request(app)
      .get(`/api/doctors/${doctorId}`);

    assert.equal(response.status, 200);

    assert.equal(
      response.body.data.id,
      doctorId,
    );

    assert.deepEqual(
      response.body.data.specialty,
      {
        id: specialtyId,
        name: "Cardiología",
      },
    );
  });

  it("POST /api/doctors rechaza matriculas duplicadas", async () => {
    const first = await request(app)
      .post("/api/doctors")
      .send(validDoctor());

    assert.equal(first.status, 201);

    const response = await request(app)
      .post("/api/doctors")
      .send(validDoctor());

    assert.equal(response.status, 409);

    assert.equal(
      response.body.error.code,
      "LICENSE_NUMBER_TAKEN",
    );
  });

  it("POST /api/doctors rechaza especialidad inexistente", async () => {
    const response = await request(app)
      .post("/api/doctors")
      .send({
        firstName: "James",
        lastName: "Wilson",
        licenseNumber: "MN-99999999",
        specialtyId: 2147483647,
      });

    assert.equal(response.status, 400);

    assert.equal(
      response.body.error.code,
      "INVALID_REFERENCE",
    );
  });

  // ==========================================
  // NURSES
  // ==========================================

  it("POST /api/nurses crea un enfermero", async () => {
    const response = await request(app)
      .post("/api/nurses")
      .send(validNurse);

    assert.equal(response.status, 201);

    assert.ok(response.body.data.id);

    assert.equal(
      response.body.data.firstName,
      "Florence",
    );

    assert.equal(
      response.body.data.licenseNumber,
      validNurse.licenseNumber,
    );

    assert.equal(
      response.body.data.createdAt,
      undefined,
    );
  });

  it("GET /api/nurses/:id devuelve el enfermero", async () => {
    const created = await request(app)
      .post("/api/nurses")
      .send(validNurse);

    assert.equal(created.status, 201);

    const nurseId = created.body.data.id;

    const response = await request(app)
      .get(`/api/nurses/${nurseId}`);

    assert.equal(response.status, 200);

    assert.equal(
      response.body.data.id,
      nurseId,
    );

    assert.equal(
      response.body.data.lastName,
      "Nightingale",
    );
  });

  it("POST /api/nurses rechaza matriculas duplicadas", async () => {
    const first = await request(app)
      .post("/api/nurses")
      .send(validNurse);

    assert.equal(first.status, 201);

    const response = await request(app)
      .post("/api/nurses")
      .send(validNurse);

    assert.equal(response.status, 409);

    assert.equal(
      response.body.error.code,
      "LICENSE_NUMBER_TAKEN",
    );
  });

  it("POST /api/nurses rechaza un body invalido", async () => {
    const response = await request(app)
      .post("/api/nurses")
      .send({
        firstName: "F",
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
});
