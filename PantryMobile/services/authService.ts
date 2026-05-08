import api from "./api";
import { tokenService } from "./tokenService";

export const authService = {
  async login(email: string, password: string): Promise<any> {
    const response = await api.post("/auth/login", { email, password });

    if (response.data && response.data.token) {
      await tokenService.saveToken(response.data.token);
    }

    return response.data;
  },

  async logout(): Promise<void> {
    await tokenService.removeToken();
  },
};
