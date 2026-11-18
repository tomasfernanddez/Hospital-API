import "dotenv/config";
import { connectDatabase, sequelize } from "./config/database.js";

await connectDatabase();
const [rows] = await sequelize.query("SELECT id, name, email FROM users ORDER BY id");
console.log(rows);
await sequelize.close();