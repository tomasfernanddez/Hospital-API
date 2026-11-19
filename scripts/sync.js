import { sequelize } from "../src/config/database.js";

// Sin este import, sequelize.models queda vacío y sync() no hace nada.
import "../src/models/user.model.js";

await sequelize.sync({ logging: console.log });
await sequelize.close();