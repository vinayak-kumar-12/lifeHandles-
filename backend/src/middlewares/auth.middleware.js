const { verifyAccessToken } = require("../utils/jwt");
const ApiError = require("../utils/apiError");

/**
 * Middleware to authenticate requests using JWT Bearer token.
 */
const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access denied. No authentication token provided.");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Access denied. Token missing.");
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new ApiError(401, "Invalid or expired access token.");
    }

    // Attach decoded user payload to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticateJWT;
