import { setToken } from "./token";
import httpClient from "./client";


export const login = async (email, password) => {
  const response = await httpClient.post("/authenticate/login", { email, password });
  const token = response.access_token;
  setToken(token);
  return token;
};

export const googleLogin = async (token) => {
    try {
      const response = await httpClient.post("/auth/google-login", { token });
      return response;
    } catch (error) {
      throw error.response?.data || "Google login failed";
    }
  };
  