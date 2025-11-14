// src/service/AxiosClient.ts
import axios from "axios";

const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"; // backend default

const axiosClient = axios.create({
  baseURL: base, // do not force '/api' here — backend's global prefix is 'api' (set in main.ts)
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// request interceptor to add token (existing logic remains)
axiosClient.interceptors.request.use(
  (config) => {
    // if you use auth tokens:
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
