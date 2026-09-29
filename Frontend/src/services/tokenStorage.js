// ============================================================
//  PadosiPro - Secure Token Storage
//  Wraps expo-secure-store for safe access + refresh token
//  persistence. Falls back to in-memory for web.
// ============================================================

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEYS = {
  ACCESS_TOKEN: "pp_access_token",
  REFRESH_TOKEN: "pp_refresh_token",
};

// In-memory fallback for web (SecureStore is native-only)
const _memoryStore = {};

const set = async (key, value) => {
  if (Platform.OS === "web") {
    _memoryStore[key] = value;
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const get = async (key) => {
  if (Platform.OS === "web") {
    return _memoryStore[key] ?? null;
  }
  return await SecureStore.getItemAsync(key);
};

const remove = async (key) => {
  if (Platform.OS === "web") {
    delete _memoryStore[key];
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

export const tokenStorage = {
  saveTokens: async (accessToken, refreshToken) => {
    await set(KEYS.ACCESS_TOKEN, accessToken);
    await set(KEYS.REFRESH_TOKEN, refreshToken);
  },

  getAccessToken: () => get(KEYS.ACCESS_TOKEN),
  getRefreshToken: () => get(KEYS.REFRESH_TOKEN),

  updateAccessToken: (accessToken) => set(KEYS.ACCESS_TOKEN, accessToken),

  clearTokens: async () => {
    await remove(KEYS.ACCESS_TOKEN);
    await remove(KEYS.REFRESH_TOKEN);
  },
};
