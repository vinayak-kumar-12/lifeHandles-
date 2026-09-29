const ApiError = require("../utils/apiError");

/**
 * Middleware factory to validate request body using a Zod schema.
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        // Extract first validation error message
        const firstIssue = result.error.issues[0];
        const errorMessage = firstIssue ? firstIssue.message : "Invalid input parameters";
        throw new ApiError(400, errorMessage, "VALIDATION_ERROR");
      }
      // Replace body with parsed & sanitized data
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
