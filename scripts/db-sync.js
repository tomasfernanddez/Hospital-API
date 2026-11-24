
import { sequelize } from "../src/models/index.js";

const force = process.argv.includes("--force");

// Evitar ejecutar una sincronización destructiva
// sobre una base que no sea de desarrollo.
if (force) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "ERROR: --force is not allowed in production",
    );

    process.exit(1);
  }

  console.warn(
    "WARNING: --force will delete all tables and their data",
  );
}

try {
  // -----------------------------------------
  // ENUM DE ROLES DE USUARIO
  // -----------------------------------------
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

  // -----------------------------------------
  // ENUM DE ESTADOS DE TURNOS
  // -----------------------------------------
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

  // -----------------------------------------
  // SINCRONIZACION DE LOS MODELOS
  // -----------------------------------------
  await sequelize.sync({
    force,
  });

  console.log("Schema synchronized");
} catch (error) {
  console.error("Unable to synchronize the schema");
  console.error(error);

  process.exitCode = 1;
} finally {
  await sequelize.close();
}
