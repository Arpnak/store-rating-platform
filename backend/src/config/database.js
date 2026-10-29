const { Pool } = require("pg");
const config = require("./config");

// A single connection pool shared across the whole app.
// pg.Pool automatically handles reconnects and idle-timeout.
const pool = new Pool(config.db);

pool.on("connect", () => {
  if (config.server.env !== "production") {
    console.log("[DB] New client connected to PostgreSQL");
  }
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected error on idle client:", err.message);
});

/**
 * Thin wrapper around pool.query so callers don't need to import pool directly.
 * Returns { rows, rowCount } just like the raw pg query.
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
