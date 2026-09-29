const ApiError = require("../utils/apiError");

/**
 * 404 Not Found handler middleware.
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Cannot ${req.method} ${req.originalUrl}`, "NOT_FOUND");
  next(error);
};

/**
 * Centralized global error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "SERVER_ERROR";

  // Hide internal database errors or unhandled exceptions in production
  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "An unexpected error occurred. Please try again later.";
  }

  // Log error details on server
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
