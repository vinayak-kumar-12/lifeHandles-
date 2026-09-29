const app = require("./app");
const { testConnection, pool } = require("./src/config/db");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

let server;

const startServer = async () => {
  console.log("🚀 Initializing PadosiPro Backend Server...");

  // Verify PostgreSQL Database Connection Pool
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.warn("⚠️ Warning: PostgreSQL connection failed. Check your DATABASE_URL in .env");
  } else {
    const initDB = require("./src/config/initDb");
    await initDB();
  }

  // Start Express HTTP Server
  const HOST = process.env.HOST || "0.0.0.0";
  server = app.listen(PORT, HOST, () => {
    console.log(`🌐 PadosiPro Backend API running on http://${HOST}:${PORT} [${process.env.NODE_ENV || "development"}]`);
    console.log(`🔗 API Base URL: http://${HOST}:${PORT}/api`);
  });
};

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log("🔒 HTTP server closed.");
      try {
        await pool.end();
        console.log("🐘 PostgreSQL connection pool closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing PostgreSQL pool:", err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();
