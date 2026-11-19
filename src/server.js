import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase, sequelize } from "./config/database.js";

const port = Number(process.env.PORT ?? 3000);

const main = async () => {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received: shutting down`);

    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

main().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});