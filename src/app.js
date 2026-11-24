
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUiDist from "swagger-ui-dist";

import { apiRouter } from "./routes/index.js";
import { authRouter } from "./routes/auth.routes.js";

import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  // Configuracion de CORS
  const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "100kb" }));

  // --------------------------------------------------
  // HEALTH CHECK
  // --------------------------------------------------

  app.get("/api/health", async (req, res) => {
    res.json({ status: "ok" });
  });

  // --------------------------------------------------
  // SWAGGER UI - DOCUMENTACION DE LA API
  // --------------------------------------------------

  // Obtener la ruta raiz del proyecto
  const projectRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );

  // Servir los archivos de Swagger UI
  app.use(
    "/docs/assets",
    express.static(swaggerUiDist.absolutePath(), {
      index: false,
    }),
  );

  // Pagina principal de Swagger
  app.get("/docs", (req, res) => {
    res.type("html").send(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hospital API - Swagger UI</title>
    <link
      rel="stylesheet"
      href="/docs/assets/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="/docs/assets/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({
        url: "/openapi.yaml",
        dom_id: "#swagger-ui",
        deepLinking: true,
        displayRequestDuration: true
      });
    </script>
  </body>
</html>`);
  });

  // Servir el contrato OpenAPI
  app.get("/openapi.yaml", (req, res) => {
    res.type("application/yaml").sendFile(
      path.join(projectRoot, "docs", "openapi.yaml"),
    );
  });

  // --------------------------------------------------
  // RUTAS DE LA API
  // --------------------------------------------------

  app.use("/api", apiRouter);
  app.use("/api/auth", authRouter);

  // --------------------------------------------------
  // MANEJO DE ERRORES
  // --------------------------------------------------

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
