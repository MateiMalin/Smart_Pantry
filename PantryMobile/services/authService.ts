import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Config";

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }
    const data = await response.json();

    //stores the token on the phone
    await AsyncStorage.setItem("token", data.token);

    return data.token;
  },
  async getToken() {
    return await AsyncStorage.getItem("token");
  },

  async logout() {
    await AsyncStorage.removeItem("token");
  },
};
