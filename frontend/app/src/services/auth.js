import { setToken } from "./token";
import httpClient from "./client";

export const login = async (email, password) => {
  const response = await httpClient.post("/authenticate/login", {
    email,
    password,
  });
  const token = response.access_token;
  setToken(token);
  return token;
};

export const googleLogin = async (token) => {
  try {
    const response = await httpClient.post("/authenticate/google-login", {
      token,
    });
    setToken(response.access_token);
    return response;
  } catch (error) {
    throw error.response?.data || "Google login failed";
  }
};

export const register = async (email, password, fullName, image = null) => {
  const data = {
    email,
    password,
    full_name: fullName,
    photo: image || null,
  };

  const response = await httpClient.post("/authenticate/register", data);

  return response;
};

export const getUnfinishedUsers = async (page = 1, pageSize = 10, full_name) => {
  const response = await httpClient.get("/authenticate", {
    params: {
      page,
      limit: pageSize,
      full_name,
    },
  });
  return response;
};

export const deleteUser = async (userId) => {
  const response = await httpClient.delete(`/authenticate/${userId}/delete`);
  return response;
};
