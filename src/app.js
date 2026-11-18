import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user.routes.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", async (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/users", userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}