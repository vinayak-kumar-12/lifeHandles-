const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const taskRoutes = require("./src/routes/task.routes");
const { globalLimiter } = require("./src/middlewares/rateLimiter.middleware");
const { notFoundHandler, errorHandler } = require("./src/middlewares/error.middleware");

const app = express();

// Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || process.env.CLIENT_URL || "*";
app.use(
  cors({
    origin: (origin, callback) => {
      // Mobile apps (React Native/Expo) and tools like Postman don't send an Origin header
      if (!origin || allowedOrigin === "*") return callback(null, true);
      const origins = allowedOrigin.split(",").map((o) => o.trim());
      if (origins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      return callback(new Error("CORS policy blocked access from this origin."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsing & Cookie Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Global Rate Limiting
app.use("/api", globalLimiter);

// Serve uploaded files statically (profile images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Production Health Check Endpoints
const healthResponse = (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    service: "PadosiPro Backend API",
    timestamp: new Date().toISOString(),
  });
};
app.get("/health", healthResponse);
app.get("/api/health", healthResponse);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// 404 & Centralized Error Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
