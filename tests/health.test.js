
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { createApp } from "../src/app.js";

test("GET /api/health devuelve 200 y status ok", async () => {
  const app = createApp();

  const response = await request(app)
    .get("/api/health");

  assert.equal(response.status, 200);

  assert.deepEqual(response.body, {
    status: "ok",
  });
});
