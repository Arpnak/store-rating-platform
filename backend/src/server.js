const app = require("./app");
const config = require("./config/config");
const { pool } = require("./config/database");

const startServer = async () => {
  // Sanity check — verify DB connectivity before accepting traffic
  try {
    await pool.query("SELECT 1");
    console.log("[Server] PostgreSQL connection verified ✓");
  } catch (err) {
    console.error("[Server] Cannot connect to PostgreSQL:", err.message);
    console.error("         Make sure your .env DB_* variables are correct and the DB is running.");
    process.exit(1);
  }

  app.listen(config.server.port, () => {
    console.log(`[Server] Running on http://localhost:${config.server.port}`);
    console.log(`[Server] Environment: ${config.server.env}`);
  });
};

// Handle unhandled promise rejections gracefully
process.on("unhandledRejection", (err) => {
  console.error("[Server] Unhandled rejection:", err.message);
  process.exit(1);
});

startServer();
