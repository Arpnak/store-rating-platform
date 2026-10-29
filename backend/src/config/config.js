// Central place to read from environment so the rest of the codebase
// never calls process.env directly — easy to swap out later.
require("dotenv").config();

const config = {
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || "store_rating_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    // Keep-alive so idle connections don't time out behind load balancers
    keepAlive: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "change_me_in_production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
    env: process.env.NODE_ENV || "development",
  },
  cors: {
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  },
};

module.exports = config;
