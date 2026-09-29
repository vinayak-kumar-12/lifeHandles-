const { Pool } = require("pg");
require("dotenv").config();

let poolConfig = {};

if (process.env.DATABASE_URL) {
  const isLocalDb =
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1");

  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalDb ? false : { rejectUnauthorized: false },
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "padosipro",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  };
}

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

/**
 * Executes a PostgreSQL query using the shared connection pool.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Tests the PostgreSQL connection on server launch.
 */
const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL Connected successfully. Database:", process.env.DB_NAME || "padosipro");
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL Connection Failed:", error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
