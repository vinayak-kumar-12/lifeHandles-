// ============================================================
//  PadosiPro - Centralized API Client
//  Handles HTTP requests, base URL, authentication headers,
//  token refresh on 401, timeout, and consistent error handling.
// ============================================================

import { Platform } from "react-native";
import { tokenStorage } from "../services/tokenStorage";

// ── Production backend (Render) ─────────────────────────────
// This is the canonical production URL. EXPO_PUBLIC_API_URL in .env
// can override this for local development only.
const PRODUCTION_API_URL = "https://lifehandles-3.onrender.com/api";

export const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

  // Use env var only if it's explicitly set to a local dev URL;
  // otherwise always fall back to production.
  if (envUrl && envUrl.length > 0 && !envUrl.includes("onrender.com")) {
    // Local dev override (e.g. http://10.0.2.2:3000/api or http://localhost:3000/api)
    if (Platform.OS === "web" && envUrl.includes("10.0.2.2")) {
      const hostname =
        typeof window !== "undefined" && window.location?.hostname
          ? window.location.hostname
          : "localhost";
      return envUrl.replace("10.0.2.2", hostname);
    }
    return envUrl;
  }

  // Default: always use production backend
  return PRODUCTION_API_URL;
};


export const getApiBase = () => {
  return getBaseUrl().replace("/api", "");
};

// Render free tier can take up to ~30s to cold-start — use a generous timeout.
const DEFAULT_TIMEOUT_MS = 30000;

let _tokenRefreshCallback = null;

/**
 * Register token refresh callback from AuthContext
 */
export const registerTokenRefreshCallback = (cb) => {
  _tokenRefreshCallback = cb;
};

/**
 * Perform fetch with timeout
 */
async function fetchWithTimeout(url, options, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err.name === "AbortError") {
      throw new Error(
        "Request timed out. The server may be starting up — please wait a moment and try again."
      );
    }
    throw new Error("Unable to connect to the server. Please check your internet connection.");
  }
}

/**
 * Main HTTP request wrapper
 */
async function request(endpoint, options = {}, isRetry = false) {
  const token = await tokenStorage.getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${getBaseUrl()}${endpoint}`;

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log(`[API REQUEST] ${options.method || "GET"} ${endpoint}`);
  }
  let response;

  try {
    response = await fetchWithTimeout(url, { ...options, headers });
  } catch (networkError) {
    throw networkError;
  }

  // Handle 401 Unauthorized (Auto-refresh token once)
  if (response.status === 401 && !isRetry && _tokenRefreshCallback) {
    try {
      const newToken = await _tokenRefreshCallback();
      if (newToken) {
        return request(endpoint, options, true);
      }
    } catch {
      // Refresh failed
    }
    throw new Error("Your session has expired. Please log in again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Received an unexpected response from the server.");
  }

  if (!response.ok) {
    // Parse error response cleanly
    const errorMessage =
      data?.message ||
      (response.status === 403
        ? "Access forbidden."
        : response.status === 404
        ? "Requested resource not found."
        : response.status === 429
        ? "Too many requests. Please try again later."
        : response.status >= 500
        ? "Server error. Please try again later."
        : "An error occurred. Please try again.");

    const err = new Error(errorMessage);
    err.status = response.status;
    err.code = data?.code;
    err.data = data;
    throw err;
  }

  return data;
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body = {}, options = {}) =>
    request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body = {}, options = {}) =>
    request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint, body = {}, options = {}) =>
    request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: "DELETE" }),
};
