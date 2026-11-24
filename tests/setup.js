
import assert from "node:assert/strict";

import { sequelize } from "../src/models/index.js";

// Verificar que estamos trabajando exclusivamente
// con la base hospital_test.
export async function verifyTestDatabase() {
  assert.equal(
    process.env.NODE_ENV,
    "test",
    "NODE_ENV debe ser test",
  );

  assert.equal(
    process.env.DB_NAME,
    "hospital_test",
    "DB_NAME debe ser hospital_test",
  );

  assert.equal(
    sequelize.getDatabaseName(),
    "hospital_test",
    "Sequelize debe apuntar a hospital_test",
  );

  const [rows] = await sequelize.query(
    "SELECT current_database() AS name",
  );

  assert.equal(
    rows[0].name,
    "hospital_test",
    "PostgreSQL no esta conectado a hospital_test",
  );
}

// Crear los ENUM nativos que utilizan
// los modelos User y Appointment.
async function createTestEnums() {
  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'user_role'
      ) THEN
        CREATE TYPE user_role AS ENUM (
          'ROLE_USER',
          'ROLE_ADMIN'
        );
      END IF;
    END
    $$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'appointment_status'
      ) THEN
        CREATE TYPE appointment_status AS ENUM (
          'SCHEDULED',
          'CANCELLED',
          'COMPLETED',
          'NO_SHOW'
        );
      END IF;
    END
    $$;
  `);
}

// Preparar el esquema desde cero.
export async function setupTestDatabase() {
  await verifyTestDatabase();

  // Los tipos deben existir antes
  // de crear las tablas que los usan.
  await createTestEnums();

  await sequelize.sync({
    force: true,
  });

  console.log(
    "Test database initialized: hospital_test",
  );
}

// Limpiar todos los registros entre pruebas.
export async function cleanTestDatabase() {
  await verifyTestDatabase();

  await sequelize.query(`
    TRUNCATE TABLE
      appointments,
      doctors,
      patients,
      nurses,
      specialties,
      users
    RESTART IDENTITY CASCADE;
  `);
}

// Cerrar las conexiones.
export async function closeTestDatabase() {
  await sequelize.close();
}
