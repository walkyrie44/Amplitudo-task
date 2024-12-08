import axios from "axios";
import { getToken } from "./token";

const baseURL = `${process.env.REACT_APP_API_URL}/api`;

const httpClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const requestAuthInterceptor = (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const responseErrorInterceptor = async (error) => {
  if (error.response && error.response.status === 401) {
    window.location.replace(`${window.location.origin}/login`);
  }
  return Promise.reject(error);
};

const responseInterceptor = (response) => {
  const status = response.status;
  if (status >= 200 && status <= 204) {
    return response.data;
  } else {
    console.error("Unexpected status code:", response.status);
  }
};

httpClient.interceptors.request.use(requestAuthInterceptor);
httpClient.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

export default httpClient;
