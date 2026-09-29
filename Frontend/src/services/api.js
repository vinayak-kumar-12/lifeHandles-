// ============================================================
//  PadosiPro - Centralized API Service Layer (Re-export Proxy)
//  All backend communication routes through src/api/
// ============================================================

export {
  apiClient,
  registerTokenRefreshCallback,
  authApi,
  userApi,
  taskApi,
} from "../api";
