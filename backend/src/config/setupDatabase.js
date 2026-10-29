/**
 * setupDatabase.js
 * Run once with: node src/config/setupDatabase.js
 * Creates all tables and seeds an initial admin account.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { pool } = require("./database");
const bcrypt = require("bcryptjs");

const createSchema = `
  -- Make sure pgcrypto is available (needed for uuid_generate_v4 on older PG)
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  -- ─── Users ──────────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS users (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(60) NOT NULL,
    email       VARCHAR(120) UNIQUE NOT NULL,
    password    TEXT        NOT NULL,
    address     VARCHAR(255),
    role        VARCHAR(20) NOT NULL DEFAULT 'normal_user'
                  CHECK (role IN ('admin', 'normal_user', 'store_owner')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ─── Stores ─────────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS stores (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(120) UNIQUE NOT NULL,
    address     VARCHAR(255),
    owner_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ─── Ratings ────────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS ratings (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score       SMALLINT    NOT NULL CHECK (score BETWEEN 1 AND 5),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (store_id, user_id)   -- one rating per user per store
  );

  -- ─── Index for fast store-average lookups ───────────────────────────────────
  CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);
  CREATE INDEX IF NOT EXISTS idx_ratings_user_id  ON ratings(user_id);
`;

const seedAdmin = async (client) => {
  const existing = await client.query(
    "SELECT id FROM users WHERE email = $1",
    ["admin@platform.com"]
  );
  if (existing.rowCount > 0) {
    console.log("[Seed] Admin account already exists — skipping.");
    return;
  }

  const hashed = await bcrypt.hash("Admin@1234", 12);
  await client.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)`,
    ["Platform Admin", "admin@platform.com", hashed, "HQ Address", "admin"]
  );
  console.log("[Seed] Admin seeded  →  email: admin@platform.com  |  password: Admin@1234");
};

(async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(createSchema);
    await seedAdmin(client);
    await client.query("COMMIT");
    console.log("[Setup] Database schema ready ✓");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Setup] Error setting up database:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
