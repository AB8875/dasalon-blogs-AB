// src/service/AxiosClient.ts
import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";

const envBase =
  process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL;

const base = envBase || "http://localhost:4000";

const axiosClient = axios.create({
  baseURL: base,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token only on client side
if (typeof window !== "undefined") {
  axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = localStorage.getItem("token");

      // Normalize headers to AxiosHeaders type
      let headers: AxiosHeaders;

      if (config.headers instanceof AxiosHeaders) {
        headers = config.headers;
      } else {
        headers = new AxiosHeaders(config.headers || {});
      }

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      config.headers = headers;

      return config;
    },
    (error) => Promise.reject(error)
  );
}

export default axiosClient;
