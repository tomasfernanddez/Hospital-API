import { sequelize } from "../src/models/index.js";

const force = process.argv.includes("--force");

if (force) {
  console.warn(
    "WARNING: --force will delete all tables and their data",
  );
}

try {
  // Crear el ENUM nativo si todavia no existe.
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

  // Sincronizar todos los modelos.
  await sequelize.sync({ force });

  console.log("Schema synchronized");
} catch (error) {
  console.error("Unable to synchronize the schema");
  console.error(error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
