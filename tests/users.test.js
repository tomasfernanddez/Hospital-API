
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

const validUser = {
  name: "Usuario de prueba",
  email: "hospital.test@example.com",
  password: "Demo_12345678!",
};

describe("Users API - Regression Tests", () => {
  before(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  after(async () => {
    await closeTestDatabase();
  });

  it("POST /api/users crea un usuario", async () => {
    const response = await request(app)
      .post("/api/users")
      .send(validUser);

    assert.equal(response.status, 201);

    assert.ok(response.body.data.id);

    assert.equal(
      response.body.data.email,
      validUser.email,
    );

    assert.equal(
      response.body.data.role,
      "ROLE_USER",
    );

    // Nunca debe exponerse la contraseña.
    assert.equal(
      response.body.data.password,
      undefined,
    );

    assert.equal(
      response.body.data.createdAt,
      undefined,
    );
  });

  it("GET /api/users devuelve una lista de usuarios", async () => {
    const created = await request(app)
      .post("/api/users")
      .send(validUser);

    assert.equal(created.status, 201);

    const response = await request(app)
      .get("/api/users");

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));

    assert.equal(response.body.data.length, 1);

    assert.equal(
      response.body.data[0].email,
      validUser.email,
    );

    assert.equal(
      response.body.data[0].password,
      undefined,
    );
  });

  it("GET /api/users/:id devuelve un usuario existente", async () => {
    const created = await request(app)
      .post("/api/users")
      .send(validUser);

    assert.equal(created.status, 201);

    const userId = created.body.data.id;

    const response = await request(app)
      .get(`/api/users/${userId}`);

    assert.equal(response.status, 200);

    assert.equal(
      response.body.data.id,
      userId,
    );

    assert.equal(
      response.body.data.role,
      "ROLE_USER",
    );

    assert.equal(
      response.body.data.password,
      undefined,
    );
  });

  it("POST /api/users rechaza emails duplicados", async () => {
    const first = await request(app)
      .post("/api/users")
      .send(validUser);

    assert.equal(first.status, 201);

    const response = await request(app)
      .post("/api/users")
      .send(validUser);

    assert.equal(response.status, 409);

    assert.equal(
      response.body.error.code,
      "EMAIL_TAKEN",
    );
  });

  it("POST /api/auth/login permite iniciar sesion", async () => {
    const created = await request(app)
      .post("/api/users")
      .send(validUser);

    assert.equal(created.status, 201);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: validUser.email,
        password: validUser.password,
      });

    assert.equal(response.status, 200);

    // La respuesta nunca debe filtrar passwords.
    assert.equal(
      JSON.stringify(response.body).includes(
        '"password"',
      ),
      false,
    );
  });

  it("POST /api/users rechaza un body invalido", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        email: "no-es-email",
      });

    assert.equal(response.status, 400);

    assert.equal(
      response.body.error.code,
      "VALIDATION_ERROR",
    );
  });
});
