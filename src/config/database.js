
import "dotenv/config";
import { Sequelize } from "sequelize";

const required = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
};

// ---------------------------------------------
// PROTECCION DE LA BASE DE DATOS DE TESTING
// ---------------------------------------------

if (process.env.NODE_ENV === "test") {
  if (process.env.DB_NAME !== "hospital_test") {
    throw new Error(
      "SAFETY ERROR: Tests must use the hospital_test database",
    );
  }
}

// ---------------------------------------------
// CONFIGURACION DE SEQUELIZE
// ---------------------------------------------

export const sequelize = new Sequelize({
  dialect: "postgres",

  host: process.env.DB_HOST ?? "127.0.0.1",

  port: Number(process.env.DB_PORT ?? 5432),

  database: required("DB_NAME"),

  username: required("DB_USER"),

  password: required("DB_PASSWORD"),

  logging:
    process.env.DB_LOGGING === "true"
      ? console.log
      : false,

  define: {
    underscored: true,
    timestamps: true,
  },

  pool: {
    max: 10,
    min: 0,
    acquire: 30_000,
    idle: 10_000,
  },
});

// ---------------------------------------------
// CONEXION A POSTGRESQL
// ---------------------------------------------

export async function connectDatabase() {
  try {
    await sequelize.authenticate();

    console.log(
      `Database connection established → ${process.env.DB_NAME}`,
    );
  } catch (error) {
    console.error("Unable to connect to the database");
    throw error;
  }
}
