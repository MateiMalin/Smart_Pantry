import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// expo-secure-store only works on native (iOS/Android).
// On web it throws an error, so we fall back to localStorage.
// localStorage is fine for dev/web — for a production web app
// you'd want httpOnly cookies instead, but this is fine for now.

const TOKEN_KEY = "auth_token";

export const tokenService = {
  async saveToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },
};
