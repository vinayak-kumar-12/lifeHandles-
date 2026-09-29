// ============================================================
//  PadosiPro - AuthContext
//  Single source of truth for authentication & user state.
// ============================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { authApi, userApi, registerTokenRefreshCallback } from "../api";
import { tokenStorage } from "../services/tokenStorage";

// ─── State Shape ─────────────────────────────────────────────
const initialState = {
  user: null,           // { id, fullName, email, phone, address, city, state, pincode, profileImage, emailVerified }
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,      // true during initial token restore
};

// ─── Reducer ─────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "RESTORE":
      return {
        ...state,
        user: action.user,
        accessToken: action.accessToken,
        isAuthenticated: !!action.accessToken && !!action.user,
        isLoading: false,
      };
    case "LOGIN":
      return {
        ...state,
        user: action.user,
        accessToken: action.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case "UPDATE_TOKEN":
      return {
        ...state,
        accessToken: action.accessToken,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.user ? { ...state.user, ...action.user } : state.user,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isRefreshingRef = useRef(false);

  // ── Restore session on app boot ──────────────────────────
  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedRefresh] = await Promise.all([
          tokenStorage.getAccessToken(),
          tokenStorage.getRefreshToken(),
        ]);

        if (!storedToken || !storedRefresh) {
          dispatch({ type: "RESTORE", user: null, accessToken: null });
          return;
        }

        // Validate stored access token by fetching profile
        try {
          const profileRes = await userApi.getProfile();
          dispatch({ type: "RESTORE", user: profileRes.user || profileRes.data?.user, accessToken: storedToken });
        } catch {
          // Access token likely expired — try refresh
          const refreshed = await _doRefresh(storedRefresh);
          if (!refreshed) {
            await tokenStorage.clearTokens();
            dispatch({ type: "RESTORE", user: null, accessToken: null });
          }
        }
      } catch {
        dispatch({ type: "RESTORE", user: null, accessToken: null });
      }
    }
    restoreSession();
  }, []);

  // ── Internal refresh function ────────────────────────────
  const _doRefresh = useCallback(async (overrideRefreshToken) => {
    if (isRefreshingRef.current) return null;
    isRefreshingRef.current = true;

    try {
      const refreshToken =
        overrideRefreshToken || (await tokenStorage.getRefreshToken());
      if (!refreshToken) return null;

      const res = await authApi.refresh({ refreshToken });
      const { accessToken: newAccess, refreshToken: newRefresh } =
        res.tokens || res.data?.tokens || {};
      if (!newAccess) return null;

      await tokenStorage.saveTokens(newAccess, newRefresh || refreshToken);
      dispatch({ type: "UPDATE_TOKEN", accessToken: newAccess });

      // Fetch updated user profile
      try {
        const profileRes = await userApi.getProfile();
        dispatch({ type: "UPDATE_USER", user: profileRes.user || profileRes.data?.user });
      } catch {
        // Non-critical
      }

      return newAccess;
    } catch {
      await tokenStorage.clearTokens();
      dispatch({ type: "LOGOUT" });
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Register refresh callback with apiClient (enables 401 auto-retry)
  useEffect(() => {
    registerTokenRefreshCallback(() => _doRefresh());
  }, [_doRefresh]);

  // ── Public API ───────────────────────────────────────────

  const register = useCallback(async (fields) => {
    return await authApi.register(fields);
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    return await authApi.verifyOTP({ email, otp });
  }, []);

  const resendOTP = useCallback(async (email) => {
    return await authApi.resendOTP({ email });
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { accessToken, refreshToken } = res.tokens || res.data?.tokens || {};
    const user = res.user || res.data?.user;

    await tokenStorage.saveTokens(accessToken, refreshToken);
    dispatch({ type: "LOGIN", user, accessToken });

    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch {
      // Proceed even if server call fails
    } finally {
      await tokenStorage.clearTokens();
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } catch {
      // Proceed anyway
    } finally {
      await tokenStorage.clearTokens();
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return authApi.forgotPassword({ email });
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    return authApi.resetPassword({ token, newPassword });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.accessToken) return;
    try {
      const res = await userApi.getProfile();
      dispatch({ type: "UPDATE_USER", user: res.user || res.data?.user });
    } catch {
      // Silently fail
    }
  }, [state.accessToken]);

  const updateProfile = useCallback(async (profileData) => {
    const res = await userApi.updateProfile(profileData);
    const updatedUser = res.user || res.data?.user;
    if (updatedUser) {
      dispatch({ type: "UPDATE_USER", user: updatedUser });
    }
    return res;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return await userApi.changePassword({ currentPassword, newPassword });
  }, []);

  const uploadProfileImage = useCallback(async (imageUri) => {
    const res = await userApi.uploadProfileImage(imageUri);
    const updatedUser = res.user || res.data?.user;
    if (updatedUser) {
      dispatch({ type: "UPDATE_USER", user: updatedUser });
    }
    return res;
  }, []);

  const removeProfileImage = useCallback(async () => {
    const res = await userApi.removeProfileImage();
    const updatedUser = res.user || res.data?.user;
    if (updatedUser) {
      dispatch({ type: "UPDATE_USER", user: updatedUser });
    }
    return res;
  }, []);

  const updateLocalUser = useCallback((fields) => {
    dispatch({ type: "UPDATE_USER", user: fields });
  }, []);

  const value = {
    // State
    user: state.user,
    accessToken: state.accessToken,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    // Actions
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
    logoutAll,
    forgotPassword,
    resetPassword,
    refreshUser,
    updateProfile,
    changePassword,
    uploadProfileImage,
    removeProfileImage,
    updateLocalUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
